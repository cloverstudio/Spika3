import { expect } from "chai";
import supertest from "supertest";
import app from "../server";
import faker from "faker";

import l, { error as e } from "../server/components/logger";
import Utils from "../server/components/utils";
import globals from "./global";

describe("Admin device management API", () => {
    describe("/api/management/device POST", () => {
        it("Should work", async () => {
            const response = await supertest(app)
                .post("/api/management/device")
                .send({
                    userId: globals.userId,
                    deviceId: faker.datatype.string(6),
                })
                .set({ "admin-accesstoken": globals.adminToken });

            globals.createdDevice = response.body.data.device;
            expect(response.status).to.eqls(200);
        });

        it("Return 403 error", async () => {
            const response = await supertest(app)
                .post("/api/management/device")
                .set({ "admin-accesstoken": "wrongtoken" });

            expect(response.status).to.eqls(403);
        });

        it("wrong user id", async () => {
            const response = await supertest(app)
                .post("/api/management/device")
                .send({
                    userId: null,
                })
                .set({ "admin-accesstoken": globals.adminToken });

            expect(response.status).to.eqls(400);
        });
    });

    describe("/api/management/device/:deviceId PUT", () => {
        it("Should work", async () => {
            const response = await supertest(app)
                .put(`/api/management/device/${globals.createdDevice!.id}`)
                .send({
                    deviceId: faker.datatype.string(6),
                    osName: "iOs",
                })
                .set({ "admin-accesstoken": globals.adminToken });

            // console.log("------------------------------------__", globals.createdDevice!.id);
            // console.log("------------------------------------__", response.body);
            globals.createdDevice = response.body.data.device;
            expect(response.status).to.eqls(200);
        });

        it("Return 403 error", async () => {
            const response = await supertest(app)
                .put(`/api/management/device/${globals.createdDevice!.id}`)
                .set({ "admin-accesstoken": "wrongtoken" });

            expect(response.status).to.eqls(403);
        });
    });

    describe("/api/management/device/:id GET", () => {
        it("Should work", async () => {
            const response = await supertest(app)
                .get(`/api/management/device/${globals.createdDevice!.id}`)
                .set({ "admin-accesstoken": globals.adminToken });

            expect(response.status).to.eqls(200);
        });
    });

    describe("/api/management/device GET", () => {
        it("Should work", async () => {
            const response = await supertest(app)
                .get(`/api/management/device`)
                .set({ "admin-accesstoken": globals.adminToken });

            expect(response.status).to.eqls(200);
            expect(response.body.data).to.be.an("object");
            expect(response.body.data.list).to.be.an("array");
            expect(response.body.data.count).to.be.an("number");
        });
    });

    describe("/api/management/device?page GET", () => {
        it("Should work", async () => {
            const response = await supertest(app)
                .get(`/api/management/device?page=1`)
                .set({ "admin-accesstoken": globals.adminToken });

            expect(response.status).to.eqls(200);
            expect(response.body.data).to.be.an("object");
            expect(response.body.data.list).to.be.an("array");
            expect(response.body.data.count).to.be.an("number");
        });
    });

    describe("/api/management/device/:id DELETE", () => {
        it("Should work", async () => {
            const response = await supertest(app)
                .delete(`/api/management/device/${globals.createdDevice!.id}`)
                .set({ "admin-accesstoken": globals.adminToken });

            expect(response.status).to.eqls(200);
        });
    });
});
