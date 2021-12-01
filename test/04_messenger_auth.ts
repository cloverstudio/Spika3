import { expect } from "chai";
import supertest from "supertest";

import app from "../server";
import faker from "faker";
import globals from "./global";
import utils from "../server/components/utils";

const telephoneNumber = `+385${faker.fake("{{datatype.number}}")}`;
const telephoneNumberHashed = utils.sha256(telephoneNumber);
const countryCode = `385`;
const deviceId = faker.random.alphaNumeric(6);

describe("API", () => {
    describe("/api/messenger/auth GET", () => {
        it("Get method doesn't work", async () => {
            const response = await supertest(app).get("/api/messenger/auth");
            expect(response.status).to.eqls(405);
        });
    });

    describe("/api/messenger/auth POST", () => {
        it("Telephone number is missing", async () => {
            const response = await supertest(app).post("/api/messenger/auth").send({
                telephoneNumber: null,
                countryCode,
                deviceId,
            });

            expect(response.status).to.eqls(400);
        });

        it("CountryCode is missing", async () => {
            const response = await supertest(app).post("/api/messenger/auth").send({
                telephoneNumber,
                countryCode: null,
                deviceId,
            });

            expect(response.status).to.eqls(400);
        });

        it("DeviceId is missing", async () => {
            const response = await supertest(app).post("/api/messenger/auth").send({
                telephoneNumber,
                countryCode,
                deviceId: null,
            });

            expect(response.status).to.eqls(400);
        });

        it("Hash is missing", async () => {
            const response = await supertest(app).post("/api/messenger/auth").send({
                telephoneNumber,
                countryCode,
                deviceId,
            });

            expect(response.status).to.eqls(400);
        });

        it("New user", async () => {
            const response = await supertest(app).post("/api/messenger/auth").send({
                telephoneNumber,
                telephoneNumberHashed,
                countryCode,
                deviceId,
            });

            expect(response.status).to.eqls(200);
            expect(response.body.data.newUser).equals(true);
            globals.userId = response.body.data.user.id;
        });

        it("Resend verification code", async () => {
            const response = await supertest(app).post("/api/messenger/auth").send({
                telephoneNumber,
                telephoneNumberHashed,
                countryCode,
                deviceId,
            });

            expect(response.status).to.eqls(200);
            expect(response.body.data.newUser).equals(true);
        });

        it("Verify verification code", async () => {
            const response = await supertest(app).post("/api/messenger/auth/verify").send({
                code: "eureka",
                deviceId,
            });
            expect(response.status).to.eqls(200);
            expect(response.body.data.device).to.have.property("token");
            globals.userToken = response.body.data.device.token;
        });

        it("Verify verification code fail", async () => {
            const response = await supertest(app).post("/api/messenger/auth/verify").send({
                code: "eureka22",
                deviceId,
            });

            expect(response.status).to.eqls(403);
        });

        it("Verify verification code wrong device id", async () => {
            const response = await supertest(app).post("/api/messenger/auth/verify").send({
                code: "eureka",
                deviceId: "wrong",
            });

            expect(response.status).to.eqls(403);
        });
    });
});
