import { expect } from "chai";
import supertest from "supertest";
import app from "../server";
import globals from "./global";
import * as Constants from "../server/components/consts";
import path from "path";
import utils from "../server/components/utils";
import createFakeFile from "./fixtures/file";
import faker from "faker";
import { after, beforeEach } from "mocha";

describe("API", () => {
    describe("/api/messenger/rooms POST", () => {
        let validParams: any = {};

        beforeEach(() => {
            validParams = {
                name: "string",
                type: "type",
                userIds: [1, 2, 3],
                adminUserIds: [1, 2, 3],
                avatarUrl: "/url/avatar",
            };
        });

        it("name param can be only string", async () => {
            const response = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, name: undefined });

            const responseInvalidNotString = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, name: 42 });

            const responseValid = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, name: "string" });

            expect(response.status).to.eqls(200);
            expect(responseInvalidNotString.status).to.eqls(400);
            expect(responseValid.status).to.eqls(200);
        });

        it("userIds param can only be array", async () => {
            const response = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, userIds: undefined });

            const responseInvalidNotArray = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, userIds: 42 });

            const responseValid = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, userIds: [1] });

            expect(response.status).to.eqls(200);
            expect(responseInvalidNotArray.status).to.eqls(400);
            expect(responseValid.status).to.eqls(200);
        });

        it("Requires userIds array to contain numbers", async () => {
            const responseInvalid = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, userIds: ["string"] });

            const responseInvalidTwo = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, userIds: [true] });

            const responseValid = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, userIds: [1] });

            expect(responseInvalid.status).to.eqls(400);
            expect(responseInvalidTwo.status).to.eqls(400);
            expect(responseValid.status).to.eqls(200);
        });

        it("adminUserIds param can only be array", async () => {
            const response = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, adminUserIds: undefined });

            const responseInvalidNotArray = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, adminUserIds: 42 });

            const responseValid = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, adminUserIds: [1] });

            expect(response.status).to.eqls(200);
            expect(responseInvalidNotArray.status).to.eqls(400);
            expect(responseValid.status).to.eqls(200);
        });

        it("Requires adminUserIds array to contain numbers", async () => {
            const responseInvalid = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, adminUserIds: ["string"] });

            const responseInvalidTwo = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, adminUserIds: [true] });

            const responseValid = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, adminUserIds: [1] });

            expect(responseInvalid.status).to.eqls(400);
            expect(responseInvalidTwo.status).to.eqls(400);
            expect(responseValid.status).to.eqls(200);
        });

        it("avatarUrl param can be only string", async () => {
            const responseUndefined = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, avatarUrl: undefined });

            const responseInvalidNotString = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, avatarUrl: 42 });

            const responseValid = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, avatarUrl: "string" });

            expect(responseUndefined.status).to.eqls(200);
            expect(responseInvalidNotString.status).to.eqls(400);
            expect(responseValid.status).to.eqls(200);
        });

        it("type param can be only string", async () => {
            const responseUndefined = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, type: undefined });

            const responseInvalidNotString = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, type: 42 });

            const responseValid = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, type: "string" });

            expect(responseUndefined.status).to.eqls(200);
            expect(responseInvalidNotString.status).to.eqls(400);
            expect(responseValid.status).to.eqls(200);
        });
    });

    /*  describe("/api/messenger/room:id PATCH", () => {
        it("return ok", async () => {
            const id = 8;

            const response = await supertest(app)
                .patch("api/messenger/room/" + id)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(200);
        });
    });

    describe("/api/messenger/room:id DELETE", () => {
        it("return ok", async () => {
            const id = 8;

            const response = await supertest(app)
                .delete("api/messenger/room/" + id)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(200);
        });
    }); */
});
