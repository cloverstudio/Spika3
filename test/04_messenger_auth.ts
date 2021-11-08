import { expect } from "chai";
import supertest from "supertest";
import crypto from "crypto";

import app from "../server";
import faker from "faker";
import globals from "./global";

const phoneNumber = `+385${faker.fake("{{datatype.number}}")}`;

const shasum = crypto.createHash("sha1");
shasum.update(phoneNumber);
const phoneNumberHash = shasum.digest("hex");
const countryCode = `385`;
const deviceId = faker.random.alphaNumeric(6);

describe("API", () => {
    describe("/api/messenger/auth GET", () => {
        it("Get method doesnt work", async () => {
            const response = await supertest(app).get("/api/messenger/auth");
            expect(response.status).to.eqls(405);
        });
    });

    describe("/api/messenger/auth GET", () => {
        it("Get method doesnt work", async () => {
            const response = await supertest(app).get("/api/messenger/auth");
            expect(response.status).to.eqls(405);
        });
    });

    describe("/api/messenger/auth POST", () => {
        it("Telephone number is missing", async () => {
            const response = await supertest(app).post("/api/messenger/auth").send({
                telephoneNumber: null,
                countryCode: countryCode,
                deviceId: deviceId,
            });

            expect(response.status).to.eqls(400);
        });

        it("CountryCode is missing", async () => {
            const response = await supertest(app).post("/api/messenger/auth").send({
                telephoneNumber: phoneNumber,
                countryCode: null,
                deviceId: deviceId,
            });

            expect(response.status).to.eqls(400);
        });

        it("DeviceId is missing", async () => {
            const response = await supertest(app).post("/api/messenger/auth").send({
                telephoneNumber: phoneNumber,
                countryCode: countryCode,
                deviceId: null,
            });

            expect(response.status).to.eqls(400);
        });

        it("Hash is missing", async () => {
            const response = await supertest(app).post("/api/messenger/auth").send({
                telephoneNumber: phoneNumber,
                countryCode: countryCode,
                deviceId: deviceId,
            });

            expect(response.status).to.eqls(400);
        });

        it("New user", async () => {
            const response = await supertest(app).post("/api/messenger/auth").send({
                telephoneNumber: phoneNumber,
                telephoneNumberHashed: phoneNumberHash,
                countryCode: countryCode,
                deviceId: deviceId,
            });

            expect(response.status).to.eqls(200);
            expect(response.body.newUser).equals(true);
            globals.userId = response.body.user.id;
        });

        it("Resend verification code", async () => {
            const response = await supertest(app).post("/api/messenger/auth").send({
                telephoneNumber: phoneNumber,
                telephoneNumberHashed: phoneNumberHash,
                countryCode: countryCode,
                deviceId: deviceId,
            });

            expect(response.status).to.eqls(200);
            expect(response.body.newUser).equals(true);
        });

        it("Verify verification code", async () => {
            const response = await supertest(app).post("/api/messenger/auth/verify").send({
                code: "eureka",
                deviceId: deviceId,
            });

            expect(response.status).to.eqls(200);
            expect(response.body.device).to.have.property("token");
            globals.userToken = response.body.device.token;
        });

        it("Verify verification code fail", async () => {
            const response = await supertest(app).post("/api/messenger/auth/verify").send({
                code: "eureka22",
                deviceId: deviceId,
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
