import { expect } from "chai";
import supertest from "supertest";
import app from "../server";
import faker from "faker";
import globals from "./global";

const phoneNumber = `+385${faker.fake("{{datatype.number}}")}`;
const countryCode = `385`;
const deviceId = faker.random.alphaNumeric(6);

describe("API", () => {
    describe("/api/messenger/test/auth GET", () => {
        it("Access token works", async () => {
            const response = await supertest(app)
                .get("/api/messenger/test/auth")
                .set({ accesstoken: globals.userToken });
            expect(response.status).to.eqls(200);
            expect(response.body.data).to.have.property("user");
            expect(response.body.data).to.have.property("device");
            expect(response.body.data.device).to.have.property("id");
            expect(response.body.data.user).to.have.property("id");
        });
    });

    describe("/api/messenger/test/auth GET", () => {
        it("403 when token doesnt exist on header", async () => {
            const response = await supertest(app).get("/api/messenger/test/auth");
            expect(response.status).to.eqls(403);
        });
    });

    describe("/api/messenger/test/auth GET", () => {
        it("Wrong access toekn", async () => {
            const response = await supertest(app)
                .get("/api/messenger/test/auth")
                .set({ accesstoken: "wrongaccesstoken" });
            expect(response.status).to.eqls(403);
        });
    });

    // device info changed
    describe("/api/messenger/test/auth GET", () => {
        it("Access token works", async () => {
            const response = await supertest(app)
                .get("/api/messenger/test/auth")
                .set({ accesstoken: globals.userToken });
            expect(response.status).to.eqls(200);
            expect(response.body.data).to.have.property("user");
            expect(response.body.data).to.have.property("device");
            expect(response.body.data.device).to.have.property("id");
            expect(response.body.data.user).to.have.property("id");
        });
    });

    // lang
    describe("/api/messenger/test/auth GET", () => {
        it("Lang works", async () => {
            const response = await supertest(app).get("/api/messenger/test/auth").set({
                accesstoken: globals.userToken,
                lang: "ja",
            });

            expect(response.status).to.eqls(200);
            expect(response.body.data).to.have.property("user");
            expect(response.body.data).to.have.property("device");
            expect(response.body.data.device).to.have.property("id");
            expect(response.body.data.user).to.have.property("id");
            expect(response.body.data.lang).to.equal("ja");
        });

        it("Lang works", async () => {
            const response = await supertest(app).get("/api/messenger/test/auth").set({
                accesstoken: globals.userToken,
            });

            expect(response.status).to.eqls(200);
            expect(response.body.data).to.have.property("user");
            expect(response.body.data).to.have.property("device");
            expect(response.body.data.device).to.have.property("id");
            expect(response.body.data.user).to.have.property("id");
            expect(response.body.data.lang).to.equal("en");
        });

        it("Lang works", async () => {
            const response = await supertest(app).get("/api/messenger/test/error").set({
                accesstoken: globals.userToken,
            });
            expect(response.status).to.eqls(400);
            expect(response.body.message).to.equal("Error happens");
        });

        it("Lang works", async () => {
            const response = await supertest(app).get("/api/messenger/test/error").set({
                accesstoken: globals.userToken,
                lang: "ja",
            });

            expect(response.status).to.eqls(400);
            expect(response.body.message).to.equal("エラーが発生しました。");
        });
    });
});
