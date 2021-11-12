import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import util from "util";
import fs from "fs";
import crypto from "crypto";
import path from "path";

const mkdir = util.promisify(fs.mkdir);
const readDir = util.promisify(fs.readdir);
const removeDir = util.promisify(fs.rmdir);
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);
const removeFile = util.promisify(fs.unlink);

const prisma = new PrismaClient();

import * as Constants from "../../../components/consts";
import l, { error as le } from "../../../components/logger";
import * as yup from "yup";
import validate from "../lib/validate";

const postFilesSchema = yup.object().shape({
    body: yup.object().shape({
        chunk: yup.string().strict().required(),
        offset: yup.number().strict().min(0).lessThan(yup.ref("total")).required(),
        total: yup.number().strict().min(1).required(),
        mimeType: yup.string().strict().required(),
        fileName: yup.string().strict().required(),
        clientId: yup.string().strict().required(),
        type: yup.string().strict().required(),
        size: yup.number().strict().min(1).required(),
        fileHash: yup.string().strict(),
        relationId: yup.number().strict(),
    }),
});

export default (): Router => {
    const router = Router();

    router.post("/", validate(postFilesSchema), async (req: Request, res: Response) => {
        try {
            const {
                chunk,
                offset,
                total,
                size,
                mimeType,
                fileName,
                fileHash,
                type,
                relationId,
                clientId,
            } = req.body;

            const exists = await prisma.file.findFirst({ where: { clientId } });

            if (exists) {
                return res.status(400).send("file with that clientId already exists");
            }
            const tempFileDir = path.join(Constants.UPLOAD_FOLDER, `.temp/${clientId}`);
            if (!fs.existsSync(tempFileDir)) {
                await mkdir(tempFileDir, { recursive: true });
            }

            await writeFile(tempFileDir + `/${offset}-chunk`, Buffer.from(chunk, "base64"));

            const files = await readDir(tempFileDir);
            const allChunks = Array(total)
                .fill(true)
                .map((_, i) => i);

            const uploadedChunks = files.map((f) => +f.split("-")[0]);
            const allChunksUploaded = allChunks.every((c) => uploadedChunks.includes(c));

            if (!allChunksUploaded) {
                return res.send({
                    data: {
                        uploadedChunks,
                    },
                });
            }

            const filesDir = path.join(Constants.UPLOAD_FOLDER, "files");
            if (!fs.existsSync(filesDir)) {
                await mkdir(filesDir);
            }

            const filePath = path.join(filesDir, clientId);
            if (fs.existsSync(filePath)) {
                // this means that some other chunk started to create file
                // not sure what to return here as file is not saved yet in db, try log line bellow
                // const file = await prisma.file.findFirst({ where: { clientId } });

                return res.send({
                    data: {
                        uploadedChunks,
                    },
                });
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
                return res.status(400).send("hash doesn't match");
            }

            const file = await prisma.file.create({
                data: {
                    fileName,
                    size,
                    mimeType,
                    type,
                    relationId,
                    clientId,
                    path: filePath,
                },
            });

            res.send({
                data: {
                    uploadedChunks,
                    file,
                },
            });

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
            res.status(500).send(`Server error ${e}`);
        }
    });

    router.get("/:id", async (req: Request, res: Response) => {
        try {
            const id = parseInt((req.params.id as string) || "");

            const file = await prisma.file.findFirst({ where: { id } });

            if (file) {
                const readable = fs.createReadStream(file.path);
                readable.pipe(res);
            } else {
                res.status(404).send(`Not found`);
            }
        } catch (e: any) {
            le(e);
            res.status(500).send(`Server error ${e}`);
        }
    });

    router.get("/check/:fileName", async (req: Request, res: Response) => {
        try {
            const { fileName } = req.params;
            const dirPath = path.join(__dirname, `../uploads/.temp/${fileName}`);

            if (!fs.existsSync(dirPath)) {
                return res.status(404).send(`Not found`);
            }

            const files = await readDir(dirPath);
            const uploadedChunks = files.map((chunkName) => +chunkName.split("-")[0]);

            res.send({ uploadedChunks });
        } catch (e: any) {
            le(e);
            res.status(500).send(`Server error ${e}`);
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

            const hash = crypto.createHash("sha1");
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
