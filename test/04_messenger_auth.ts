import { expect } from "chai";
import supertest from "supertest";

import app from "../server";
import faker from "faker";
import globals from "./global";
import utils from "../server/components/utils";

const telephoneNumber = `+385${faker.fake("{{datatype.number}}")}`;
const telephoneNumberHashed = utils.sha256(telephoneNumber);
const telephoneNumber2 = `+385${faker.fake("{{datatype.number}}")}`;
const telephoneNumberHashed2 = utils.sha256(telephoneNumber);
const telephoneNumber3 = `+385${faker.fake("{{datatype.number}}")}`;
const telephoneNumberHashed3 = utils.sha256(telephoneNumber);
const deviceId = faker.random.alphaNumeric(6);
const deviceId2 = faker.random.alphaNumeric(6);

const telephoneNumber4 = `+385${faker.fake("{{datatype.number}}")}`;
const telephoneNumberHashed4 = utils.sha256(telephoneNumber);
const telephoneNumber5 = `+385${faker.fake("{{datatype.number}}")}`;
const telephoneNumberHashed5 = utils.sha256(telephoneNumber);
const deviceId4 = faker.random.alphaNumeric(6);

const telephoneNumber6 = `+385${faker.fake("{{datatype.number}}")}`;
const telephoneNumberHashed6 = utils.sha256(telephoneNumber);
const deviceId6 = faker.random.alphaNumeric(6);
const telephoneNumber7 = `+385${faker.fake("{{datatype.number}}")}`;
const telephoneNumberHashed7 = utils.sha256(telephoneNumber);
const deviceId7 = faker.random.alphaNumeric(6);

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
                deviceId,
            });

            expect(response.status).to.eqls(400);
        });

        it("DeviceId is missing", async () => {
            const response = await supertest(app).post("/api/messenger/auth").send({
                telephoneNumber,
                deviceId: null,
            });

            expect(response.status).to.eqls(400);
        });

        it("New user", async () => {
            const response = await supertest(app).post("/api/messenger/auth").send({
                telephoneNumber,
                telephoneNumberHashed,
                deviceId,
            });

            expect(response.status).to.eqls(200);
            expect(response.body.data.isNewUser).equals(true);
            globals.userId = response.body.data.user.id;
        });

        it("Resend verification code", async () => {
            const response = await supertest(app).post("/api/messenger/auth").send({
                telephoneNumber,
                telephoneNumberHashed,
                deviceId,
            });

            expect(response.status).to.eqls(200);
            expect(response.body.data.isNewUser).equals(true);
        });

        it("Verify verification code", async () => {
            const response = await supertest(app).post("/api/messenger/auth/verify").send({
                code: "eureka",
                deviceId,
            });
            expect(response.status).to.eqls(200);
            expect(response.body.data.device).to.have.property("token");
            globals.userToken = response.body.data.device.token;
            globals.deviceId = response.body.data.device.id;
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

        it("New user2 change the telephone number before signed up should work", async () => {
            const response = await supertest(app).post("/api/messenger/auth").send({
                telephoneNumber: telephoneNumber2,
                telephoneNumberHashed: telephoneNumberHashed2,
                deviceId: deviceId2,
            });

            expect(response.status).to.eqls(200);
            expect(response.body.data.isNewUser).equals(true);

            const response2 = await supertest(app).post("/api/messenger/auth").send({
                telephoneNumber: telephoneNumber3,
                telephoneNumberHashed: telephoneNumberHashed3,
                deviceId: deviceId2,
            });

            expect(response2.status).to.eqls(200);
            expect(response2.body.data.isNewUser).equals(true);

            const response3 = await supertest(app).post("/api/messenger/auth/verify").send({
                code: "eureka",
                deviceId: deviceId2,
            });

            expect(response3.status).to.eqls(200);
            expect(response3.body.data.device).to.have.property("token");
        });

        it("New user3 tried to signup with different telephone number should work", async () => {
            const response = await supertest(app).post("/api/messenger/auth").send({
                telephoneNumber: telephoneNumber4,
                telephoneNumberHashed: telephoneNumberHashed4,
                deviceId: deviceId4,
            });

            expect(response.status).to.eqls(200);
            expect(response.body.data.isNewUser).equals(true);

            const response2 = await supertest(app).post("/api/messenger/auth/verify").send({
                code: "eureka",
                deviceId: deviceId4,
            });

            expect(response2.status).to.eqls(200);
            expect(response2.body.data.device).to.have.property("token");

            const response3 = await supertest(app).post("/api/messenger/auth").send({
                telephoneNumber: telephoneNumber5,
                telephoneNumberHashed: telephoneNumberHashed5,
                deviceId: deviceId4,
            });

            expect(response3.status).to.eqls(200);

            const response4 = await supertest(app).post("/api/messenger/auth/verify").send({
                code: "eureka",
                deviceId: deviceId4,
            });

            expect(response4.status).to.eqls(200);
            expect(response4.body.data.device).to.have.property("token");
        });

        it("Someone occasionally input existed telephone number", async () => {
            // new user signed up
            const response = await supertest(app).post("/api/messenger/auth").send({
                telephoneNumber: telephoneNumber6,
                telephoneNumberHashed: telephoneNumberHashed6,
                deviceId: deviceId6,
            });

            expect(response.status).to.eqls(200);
            expect(response.body.data.isNewUser).equals(true);

            const response2 = await supertest(app).post("/api/messenger/auth/verify").send({
                code: "eureka",
                deviceId: deviceId6,
            });

            expect(response2.status).to.eqls(200);
            expect(response2.body.data.device).to.have.property("token");

            // another use put previous user's telephone number by mistake
            const response3 = await supertest(app).post("/api/messenger/auth").send({
                telephoneNumber: telephoneNumber6,
                telephoneNumberHashed: telephoneNumberHashed6,
                deviceId: deviceId7,
            });

            expect(response3.status).to.eqls(200);

            // the user trys again with his phone number
            const response4 = await supertest(app).post("/api/messenger/auth").send({
                telephoneNumber: telephoneNumber7,
                telephoneNumberHashed: telephoneNumberHashed7,
                deviceId: deviceId7,
            });

            expect(response4.status).to.eqls(200);

            // should work
            const response5 = await supertest(app).post("/api/messenger/auth/verify").send({
                code: "eureka",
                deviceId: deviceId7,
            });

            expect(response5.status).to.eqls(200);
            expect(response5.body.data.device).to.have.property("token");
        });
    });

    describe("/api/messenger/me/settings GET", () => {
        it("Get user settings works", async () => {
            const response = await supertest(app)
                .get("/api/messenger/me/settings")
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(200);
        });
    });
});
