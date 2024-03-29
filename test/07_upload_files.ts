import { expect } from "chai";
import supertest from "supertest";
import app from "../server";
import globals from "./global";
import util from "util";
import fs from "fs";
import path from "path";
import utils from "../server/components/utils";
import createFakeFile from "./fixtures/file";
import faker from "faker";
import { after, beforeEach } from "mocha";
import crypto from "crypto";

const readDir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);

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
                clientId: encodeURIComponent(faker.datatype.string(52)),
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
                .send(validParams);

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

        it("Uploads chunk of file", async () => {
            const fileName = "test File";
            const chunk = Buffer.from("101").toString("base64");
            const offset = 0;
            const clientId = encodeURIComponent(faker.datatype.string(52));

            const responseValid = await supertest(app)
                .post("/api/upload/files")
                .set({ accesstoken: globals.userToken })
                .send({
                    ...validParams,
                    fileName,
                    chunk,
                    offset,
                    total: 2,
                    clientId,
                });

            expect(responseValid.status).to.eqls(200);
            expect(responseValid.body).to.has.property("data");
            expect(responseValid.body.data).to.has.property("uploadedChunks");
            expect(responseValid.body.data.uploadedChunks).to.be.an("array").that.does.include(0);
            expect(responseValid.body.data.uploadedChunks).to.have.lengthOf(1);

            const tempFileDir = path.resolve(
                __dirname,
                "../../",
                process.env["UPLOAD_FOLDER"],
                `.temp/${clientId}`
            );

            const tempFileDirExists = fs.existsSync(tempFileDir);

            expect(tempFileDirExists).to.eqls(true);

            const files = await readDir(tempFileDir);
            expect(files).to.be.an("array").that.does.include(`${offset}-chunk`);

            const content = await readFile(tempFileDir + `/${offset}-chunk`);
            expect(content.toString()).to.eqls("101");
        });
    });

    describe("/api/upload/files/verify POST", () => {
        let validParams: any = {};

        beforeEach(async () => {
            const chunk = Buffer.from("101").toString("base64");
            const offset = 0;
            const clientId = encodeURIComponent(faker.datatype.string(52));
            const hash = utils.sha256("101");

            try {
                await supertest(app)
                    .post("/api/upload/files")
                    .set({ accesstoken: globals.userToken })
                    .send({
                        chunk,
                        offset,
                        clientId,
                    });
            } catch (error) {
                console.log({ "beforeEach upload chunk error": error });
            }

            validParams = {
                clientId,
                size: 200,
                mimeType: "string",
                fileName: "string",
                type: "string",
                total: 1,
                relationId: 8,
                fileHash: hash,
            };
        });

        after(async () => {
            await globals.prisma.file.deleteMany();
        });

        it("Requires total param to be number", async () => {
            const responseInvalid = await supertest(app)
                .post("/api/upload/files/verify")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, total: undefined });

            const responseInvalidNotNumber = await supertest(app)
                .post("/api/upload/files/verify")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, total: "string" });

            const responseInvalidZero = await supertest(app)
                .post("/api/upload/files/verify")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, total: 0 });

            const responseValid = await supertest(app)
                .post("/api/upload/files/verify")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, total: 1 });

            expect(responseInvalid.status).to.eqls(400);
            expect(responseInvalidNotNumber.status).to.eqls(400);
            expect(responseInvalidZero.status).to.eqls(400);
            expect(responseValid.status).to.eqls(200);
        });

        it("Requires size param to be positive number", async () => {
            const responseInvalid = await supertest(app)
                .post("/api/upload/files/verify")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, size: undefined });

            const responseInvalidNotNumber = await supertest(app)
                .post("/api/upload/files/verify")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, size: "string" });

            const responseInvalidZero = await supertest(app)
                .post("/api/upload/files/verify")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, size: 0 });

            const responseValid = await supertest(app)
                .post("/api/upload/files/verify")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, size: 42 });

            expect(responseInvalid.status).to.eqls(400);
            expect(responseInvalidNotNumber.status).to.eqls(400);
            expect(responseInvalidZero.status).to.eqls(400);
            expect(responseValid.status).to.eqls(200);
        });

        it("Requires type param to be string", async () => {
            const responseInvalid = await supertest(app)
                .post("/api/upload/files/verify")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, type: undefined });

            const responseInvalidNotString = await supertest(app)
                .post("/api/upload/files/verify")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, type: 42 });

            const responseValid = await supertest(app)
                .post("/api/upload/files/verify")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, type: "string" });

            expect(responseInvalid.status).to.eqls(400);
            expect(responseInvalidNotString.status).to.eqls(400);
            expect(responseValid.status).to.eqls(200);
        });

        it("Requires clientId param to be string", async () => {
            const responseInvalid = await supertest(app)
                .post("/api/upload/files/verify")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, clientId: undefined });

            const responseInvalidNotString = await supertest(app)
                .post("/api/upload/files/verify")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, clientId: 42 });

            const responseValid = await supertest(app)
                .post("/api/upload/files/verify")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams });

            expect(responseInvalid.status).to.eqls(400);
            expect(responseInvalidNotString.status).to.eqls(400);
            expect(responseValid.status).to.eqls(200);
        });

        it("Requires clientId param to be unique", async () => {
            const clientId = faker.datatype.string(20);
            await createFakeFile({ clientId });
            const responseInvalid = await supertest(app)
                .post("/api/upload/files/verify")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, clientId });

            expect(responseInvalid.status).to.eqls(409);
        });

        it("Requires mimeType param to be string", async () => {
            const responseInvalid = await supertest(app)
                .post("/api/upload/files/verify")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, mimeType: undefined });

            const responseInvalidNotString = await supertest(app)
                .post("/api/upload/files/verify")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, mimeType: 42 });

            const responseValid = await supertest(app)
                .post("/api/upload/files/verify")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, mimeType: "string" });

            expect(responseInvalid.status).to.eqls(400);
            expect(responseInvalidNotString.status).to.eqls(400);
            expect(responseValid.status).to.eqls(200);
        });

        it("requires fileHash param to be string", async () => {
            const responseNoParam = await supertest(app)
                .post("/api/upload/files/verify")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, fileHash: undefined });

            const responseInvalidNotString = await supertest(app)
                .post("/api/upload/files/verify")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, fileHash: 42 });

            const responseValid = await supertest(app)
                .post("/api/upload/files/verify")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams });

            expect(responseInvalidNotString.status).to.eqls(411);
            expect(responseNoParam.status).to.eqls(400);
            expect(responseValid.status).to.eqls(200);
        });

        it("Requires relationId param to be number", async () => {
            const responseNoParam = await supertest(app)
                .post("/api/upload/files/verify")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, relationId: undefined });

            const responseInvalidNotNumber = await supertest(app)
                .post("/api/upload/files/verify")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, relationId: "42" });

            expect(responseInvalidNotNumber.status).to.eqls(400);
            expect(responseNoParam.status).to.eqls(200);
        });

        it("Metadata", async () => {
            const responseValid = await supertest(app)
                .post("/api/upload/files/verify")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, metaData: { duration: 1, width: 2, height: 3 } });

            expect(responseValid.status).to.eqls(200);
            expect(responseValid.body.data.file).to.has.property("metaData");
            expect(responseValid.body.data.file.metaData).to.has.property("duration");
            expect(responseValid.body.data.file.metaData.duration).to.eqls(1);
            expect(responseValid.body.data.file.metaData.width).to.eqls(2);
            expect(responseValid.body.data.file.metaData.height).to.eqls(3);
        });
    });
});

async function createFileHash(filePath: string) {
    return new Promise((resolve, reject) => {
        try {
            const readable = fs.createReadStream(filePath);

            const hash = crypto.createHash("sha256");
            hash.setEncoding("hex");

            readable.on("end", function () {
                hash.end();

                const result = hash.read().toString("hex");

                if (!result) {
                    return reject("Hash create failed");
                }

                return resolve(result);
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
