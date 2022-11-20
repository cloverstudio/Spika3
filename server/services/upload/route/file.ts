import { Router, Request, Response } from "express";
import * as yup from "yup";
import util from "util";
import fs from "fs";
import crypto from "crypto";
import path from "path";

import { successResponse, errorResponse } from "../../../components/response";
import { error as le } from "../../../components/logger";
import validate from "../../../components/validateMiddleware";
import sanitize from "../../../components/sanitize";
import { UserRequest } from "../lib/types";
import prisma from "../../../components/prisma";

const mkdir = util.promisify(fs.mkdir);
const readDir = util.promisify(fs.readdir);
const removeDir = util.promisify(fs.rmdir);
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);
const removeFile = util.promisify(fs.unlink);

const postFilesSchema = yup.object().shape({
    body: yup.object().shape({
        chunk: yup.string().strict().required(),
        offset: yup.number().strict().min(0).required(),
        clientId: yup.string().strict().required(),
    }),
});

const verifyFilesSchema = yup.object().shape({
    body: yup.object().shape({
        mimeType: yup.string().strict().required(),
        fileName: yup.string().strict().required(),
        clientId: yup.string().strict().required(),
        type: yup.string().strict().required(),
        size: yup.number().strict().min(1).required(),
        total: yup.number().strict().min(1).required(),
        fileHash: yup.string().required(),
        relationId: yup.number().strict(),
    }),
});

export default (): Router => {
    const router = Router();

    router.post("/", validate(postFilesSchema), async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        try {
            const { chunk, offset, clientId } = req.body;

            const exists = await prisma.file.findFirst({ where: { clientId } });

            if (exists) {
                return res
                    .status(400)
                    .send(errorResponse("File with that clientId already exists", userReq.lang));
            }

            const tempFileDir = path.resolve(
                __dirname,
                "../../../../../",
                process.env["UPLOAD_FOLDER"],
                ".temp/",
                clientId
            );

            if (!fs.existsSync(tempFileDir)) {
                await mkdir(tempFileDir, { recursive: true });
            }

            await writeFile(tempFileDir + `/${offset}-chunk`, Buffer.from(chunk, "base64"));

            const files = await readDir(tempFileDir);

            const uploadedChunks = files.map((f) => +f.split("-")[0]);

            return res.send(successResponse({ uploadedChunks }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.post("/verify", validate(verifyFilesSchema), async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        try {
            const { total, size, mimeType, fileName, fileHash, type, relationId, clientId } =
                req.body;

            const exists = await prisma.file.findFirst({ where: { clientId } });

            if (exists) {
                return res
                    .status(400)
                    .send(errorResponse("File with that clientId already exists", userReq.lang));
            }

            const tempFileDir = path.resolve(
                __dirname,
                "../../../../../",
                process.env["UPLOAD_FOLDER"],
                ".temp/",
                clientId
            );

            if (!fs.existsSync(tempFileDir)) {
                await mkdir(tempFileDir, { recursive: true });
            }

            const files = await readDir(tempFileDir);
            const allChunks = Array(total)
                .fill(true)
                .map((_, i) => i);

            const uploadedChunks = files.map((f) => +f.split("-")[0]);
            const allChunksUploaded = allChunks.every((c) => uploadedChunks.includes(c));

            if (!allChunksUploaded) {
                return res
                    .status(400)
                    .send(errorResponse("Not all chunks are uploaded", userReq.lang));
            }

            const filesDir = path.resolve(
                __dirname,
                "../../../../../",
                process.env["UPLOAD_FOLDER"],
                "files/"
            );

            if (!fs.existsSync(filesDir)) {
                await mkdir(filesDir);
            }

            const filePath = path.join(filesDir, clientId);
            if (fs.existsSync(filePath)) {
                // this means that some other chunk started to create file
                // not sure what to return here as file is not saved yet in db, try log line bellow
                // const file = await prisma.file.findFirst({ where: { clientId } });

                return res.send(successResponse({ uploadedChunks }, userReq.lang));
            }

            await writeFile(filePath, "");
            const writeStream = fs.createWriteStream(filePath);

            for (const chunkIndex of allChunks) {
                const content = await readFile(tempFileDir + `/${chunkIndex}-chunk`);
                writeStream.write(content);
            }

            writeStream.end();

            const hashMatches = await checkHashes(fileHash, filePath);
            if (!hashMatches) {
                await removeFile(filePath);
                return res.status(400).send(errorResponse("Hash doesn't match", userReq.lang));
            }

            const file = await prisma.file.create({
                data: {
                    fileName,
                    size,
                    mimeType,
                    type,
                    relationId,
                    clientId,
                    path: "/uploads/files/" + clientId,
                },
            });

            res.send(successResponse({ file: sanitize(file).file() }, userReq.lang));

            try {
                for (const fileName of await readDir(tempFileDir)) {
                    if (fs.existsSync(path.join(tempFileDir, fileName))) {
                        await removeFile(path.join(tempFileDir, fileName));
                    }
                }

                if (fs.existsSync(tempFileDir)) {
                    await removeDir(tempFileDir);
                }
            } catch (error) {
                // ignore ENOENT unlink errors that happens because of concurrency
            }
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.get("/:id", async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        try {
            const id = parseInt((req.params.id as string) || "");

            const file = await prisma.file.findFirst({ where: { id } });

            if (!file) {
                return res.status(404).send(errorResponse("Not found", userReq.lang));
            }

            if (process.env.IS_TEST === "1") {
                return res.send(successResponse({}, userReq.lang));
            }

            const pathToFile = path.resolve(
                __dirname,
                "../../../../../",
                process.env["UPLOAD_FOLDER"],
                "files/",
                file.clientId
            );

            if (!fs.existsSync(pathToFile)) {
                return res.status(404).send(errorResponse("Not found", userReq.lang));
            }

            res.download(pathToFile, file.fileName);
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.get("/check/:fileName", async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        try {
            const { fileName } = req.params;

            const dirPath = path.resolve(
                __dirname,
                "../../../../../",
                process.env["UPLOAD_FOLDER"],
                ".temp/",
                fileName
            );

            if (!fs.existsSync(dirPath)) {
                return res.status(404).send(errorResponse("Not found", userReq.lang));
            }

            const files = await readDir(dirPath);
            const uploadedChunks = files.map((chunkName) => +chunkName.split("-")[0]);

            res.send(successResponse({ uploadedChunks }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    return router;
};

async function checkHashes(hashed: string, filePath: string) {
    return new Promise((resolve, reject) => {
        try {
            if (!hashed) {
                return resolve(true);
            }
            const readable = fs.createReadStream(filePath);

            const hash = crypto.createHash("sha256");
            hash.setEncoding("hex");

            readable.on("end", function () {
                hash.end();

                const result = hash.read().toString("hex");

                if (!result) {
                    console.log({ hashedFailed: hashed });
                    return resolve(false);
                }

                return resolve(result == hashed);
            });

            readable.on("error", function (error) {
                hash.end();
                return reject(error);
            });

            readable.pipe(hash);
        } catch (error) {
            console.log({ error });
            reject(error);
        }
    });
}
