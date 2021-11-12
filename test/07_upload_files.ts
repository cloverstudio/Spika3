import { expect } from "chai";
import supertest from "supertest";
import app from "../server";
import globals from "./global";
import util from "util";
import fs from "fs";
import * as Constants from "../server/components/consts";
import path from "path";
import utils from "../server/components/utils";
import createFakeFile from "./fixtures/file";
import faker from "faker";
import { after, beforeEach } from "mocha";

const readDir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const getFileStat = util.promisify(fs.stat);

describe("API", () => {
    describe("/api/upload/files/:id GET", () => {
        it("return 404 if no file", async () => {
            const responseInvalid = await supertest(app).get("/api/upload/files/125875288");

            expect(responseInvalid.status).to.eqls(404);
        });

        it("returns file", async () => {
            const fileName = "test.png";
            const filePath = path.join(__dirname, `fixtures/files/${fileName}`);
            const file = await createFakeFile({ path: filePath, fileName });
            const responseValid = await supertest(app).get("/api/upload/files/" + file.id);

            expect(responseValid.status).to.eqls(200);
        });
    });

    describe("/api/upload/files POST", () => {
        let validParams: any = {};

        beforeEach(() => {
            validParams = {
                chunk: "string",
                offset: 0,
                total: 10,
                size: 200,
                mimeType: "string",
                fileName: "string",
                type: "string",
                fileHash: "string",
                relationId: 8,
                clientId: String(faker.datatype.number({ min: 1, max: 10000 })),
            };
        });

        after(async () => {
            await globals.prisma.file.deleteMany();
        });

        it("Requires chunk param to be string", async () => {
            const responseInvalid = await supertest(app)
                .post("/api/upload/files")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, chunk: undefined });

            const responseInvalidNotString = await supertest(app)
                .post("/api/upload/files")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, chunk: 42 });

            const responseValid = await supertest(app)
                .post("/api/upload/files")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, chunk: "string" });

            expect(responseInvalid.status).to.eqls(400);
            expect(responseInvalidNotString.status).to.eqls(400);
            expect(responseValid.status).to.eqls(200);
        });

        it("Requires offset param to be number", async () => {
            const responseInvalid = await supertest(app)
                .post("/api/upload/files")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, offset: undefined });

            const responseInvalidNotNumber = await supertest(app)
                .post("/api/upload/files")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, offset: "string" });

            const responseValid = await supertest(app)
                .post("/api/upload/files")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, offset: 0 });

            expect(responseInvalid.status).to.eqls(400);
            expect(responseInvalidNotNumber.status).to.eqls(400);
            expect(responseValid.status).to.eqls(200);
        });

        it("Requires offset param to be less than total", async () => {
            const responseInvalid = await supertest(app)
                .post("/api/upload/files")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, offset: 22, total: 10 });

            const responseValid = await supertest(app)
                .post("/api/upload/files")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, offset: 42, total: 43 });

            expect(responseInvalid.status).to.eqls(400);
            expect(responseValid.status).to.eqls(200);
        });

        it("Requires total param to be number", async () => {
            const responseInvalid = await supertest(app)
                .post("/api/upload/files")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, total: undefined });

            const responseInvalidNotNumber = await supertest(app)
                .post("/api/upload/files")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, total: "string" });

            const responseInvalidZero = await supertest(app)
                .post("/api/upload/files")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, total: 0 });

            const responseValid = await supertest(app)
                .post("/api/upload/files")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, total: 42 });

            expect(responseInvalid.status).to.eqls(400);
            expect(responseInvalidNotNumber.status).to.eqls(400);
            expect(responseInvalidZero.status).to.eqls(400);
            expect(responseValid.status).to.eqls(200);
        });

        it("Requires size param to be positive number", async () => {
            const responseInvalid = await supertest(app)
                .post("/api/upload/files")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, size: undefined });

            const responseInvalidNotNumber = await supertest(app)
                .post("/api/upload/files")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, size: "string" });

            const responseInvalidZero = await supertest(app)
                .post("/api/upload/files")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, size: 0 });

            const responseValid = await supertest(app)
                .post("/api/upload/files")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, size: 42 });

            expect(responseInvalid.status).to.eqls(400);
            expect(responseInvalidNotNumber.status).to.eqls(400);
            expect(responseInvalidZero.status).to.eqls(400);
            expect(responseValid.status).to.eqls(200);
        });

        it("Requires type param to be string", async () => {
            const responseInvalid = await supertest(app)
                .post("/api/upload/files")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, type: undefined });

            const responseInvalidNotString = await supertest(app)
                .post("/api/upload/files")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, type: 42 });

            const responseValid = await supertest(app)
                .post("/api/upload/files")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, type: "string" });

            expect(responseInvalid.status).to.eqls(400);
            expect(responseInvalidNotString.status).to.eqls(400);
            expect(responseValid.status).to.eqls(200);
        });

        it("Requires clientId param to be string", async () => {
            const responseInvalid = await supertest(app)
                .post("/api/upload/files")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, clientId: undefined });

            const responseInvalidNotString = await supertest(app)
                .post("/api/upload/files")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, clientId: 42 });

            const responseValid = await supertest(app)
                .post("/api/upload/files")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, clientId: "string" });

            expect(responseInvalid.status).to.eqls(400);
            expect(responseInvalidNotString.status).to.eqls(400);
            expect(responseValid.status).to.eqls(200);
        });

        it("Requires clientId param to be unique", async () => {
            const clientId = faker.datatype.string(20);
            await createFakeFile({ clientId });
            const responseInvalid = await supertest(app)
                .post("/api/upload/files")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, clientId });

            expect(responseInvalid.status).to.eqls(400);
        });

        it("Requires mimeType param to be string", async () => {
            const responseInvalid = await supertest(app)
                .post("/api/upload/files")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, mimeType: undefined });

            const responseInvalidNotString = await supertest(app)
                .post("/api/upload/files")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, mimeType: 42 });

            const responseValid = await supertest(app)
                .post("/api/upload/files")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, mimeType: "string" });

            expect(responseInvalid.status).to.eqls(400);
            expect(responseInvalidNotString.status).to.eqls(400);
            expect(responseValid.status).to.eqls(200);
        });

        it("If defined, requires fileHash param to be string", async () => {
            const responseNoParam = await supertest(app)
                .post("/api/upload/files")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, fileHash: undefined });

            const responseInvalidNotString = await supertest(app)
                .post("/api/upload/files")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, fileHash: 42 });

            const responseValid = await supertest(app)
                .post("/api/upload/files")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, fileHash: "string" });

            expect(responseInvalidNotString.status).to.eqls(400);
            expect(responseNoParam.status).to.eqls(200);
            expect(responseValid.status).to.eqls(200);
        });

        it("If defined, requires relationId param to be number", async () => {
            const responseNoParam = await supertest(app)
                .post("/api/upload/files")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, relationId: undefined });

            const responseInvalidNotNumber = await supertest(app)
                .post("/api/upload/files")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, relationId: "42" });

            const responseValid = await supertest(app)
                .post("/api/upload/files")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, relationId: 5 });

            expect(responseInvalidNotNumber.status).to.eqls(400);
            expect(responseNoParam.status).to.eqls(200);
            expect(responseValid.status).to.eqls(200);
        });

        it("Returns error if hash is not matching", async () => {
            const fileName = "test.png";
            const filePath = path.join(__dirname, `fixtures/files/${fileName}`);
            const fileHash = "wrong hash";
            const { size } = await getFileStat(filePath);
            const chunkSize = 8; // in bytes
            const readable = fs.createReadStream(filePath, { highWaterMark: chunkSize });
            const total = Math.ceil(size / chunkSize);

            let offset = -1;

            readable.on("data", async function (chunk) {
                offset++;
                await supertest(app)
                    .post("/api/upload/files")
                    .set({ accesstoken: globals.userToken })
                    .send({
                        ...validParams,
                        fileName,
                        chunk: chunk.toString("base64"),
                        offset,
                        total,
                        size,
                        fileHash,
                    });
            });

            await utils.wait(1);

            const filesDir = path.join(Constants.UPLOAD_FOLDER, `files`);
            const files = await readDir(filesDir);
            expect(files).to.be.an("array").that.does.not.include(validParams.clientId);

            const fileFromDb = await globals.prisma.file.findFirst({
                where: { clientId: validParams.clientId },
            });
            expect(fileFromDb).to.eqls(null);
        });

        it("Uploads chunk of file", async () => {
            const fileName = "test File";
            const chunk = Buffer.from("101").toString("base64");
            const offset = 0;

            const responseValid = await supertest(app)
                .post("/api/upload/files")
                .set({ accesstoken: globals.userToken })
                .send({
                    ...validParams,
                    fileName,
                    chunk,
                    offset,
                    total: 2,
                });

            expect(responseValid.status).to.eqls(200);
            expect(responseValid.body).to.has.property("data");
            expect(responseValid.body.data).to.has.property("uploadedChunks");
            expect(responseValid.body.data.uploadedChunks).to.be.an("array").that.does.include(0);
            expect(responseValid.body.data.uploadedChunks).to.have.lengthOf(1);

            const tempFileDir = path.join(Constants.UPLOAD_FOLDER, `.temp/${validParams.clientId}`);
            const tempFileDirExists = fs.existsSync(tempFileDir);

            expect(tempFileDirExists).to.eqls(true);

            const files = await readDir(tempFileDir);
            expect(files).to.be.an("array").that.does.include(`${offset}-chunk`);

            const content = await readFile(tempFileDir + `/${offset}-chunk`);
            expect(content.toString()).to.eqls("101");
        });

        it("Uploads file", async () => {
            const fileName = "test.png";
            const filePath = path.join(__dirname, `fixtures/files/${fileName}`);
            const { size } = await getFileStat(filePath);
            const chunkSize = 8; // in bytes
            const readable = fs.createReadStream(filePath, { highWaterMark: chunkSize });
            const total = Math.ceil(size / chunkSize);

            let offset = -1;

            readable.on("data", async function (chunk) {
                offset++;
                await supertest(app)
                    .post("/api/upload/files")
                    .set({ accesstoken: globals.userToken })
                    .send({
                        ...validParams,
                        fileName,
                        chunk: chunk.toString("base64"),
                        offset,
                        total,
                        size,
                        fileHash: undefined,
                    });
            });

            await utils.wait(1);

            const filesDir = path.join(Constants.UPLOAD_FOLDER, `files`);
            const filesDirExists = fs.existsSync(filesDir);

            expect(filesDirExists).to.eqls(true);

            const files = await readDir(filesDir);
            expect(files).to.be.an("array").that.does.include(validParams.clientId);

            const originalFile = await readFile(filePath);
            const content = await readFile(filesDir + `/${validParams.clientId}`);
            expect(content.toString()).to.eqls(originalFile.toString());

            const createdFile = await globals.prisma.file.findFirst({
                where: { clientId: validParams.clientId },
            });
            expect(createdFile.fileName).to.eqls(fileName);
        });
    });
});
