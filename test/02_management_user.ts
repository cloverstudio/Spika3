import { expect } from "chai";
import supertest from "supertest";
import app from "../server";
import faker from "faker";

import l, { error as e } from "../server/components/logger";
import Utils from "../server/components/utils";
import globals from "./global";

describe("Admin user management API", () => {
    describe("/api/management/user POST", () => {
        it("Should work", async () => {
            const response = await supertest(app)
                .post("/api/management/user")
                .send({
                    displayName: faker.name.firstName(),
                })
                .set({ "admin-accesstoken": globals.adminToken });

            globals.createdUser = response.body;
            expect(response.status).to.eqls(200);
        });

        it("Return 403 error", async () => {
            const response = await supertest(app)
                .post("/api/management/user")
                .set({ "admin-accesstoken": "wrongtoken" });

            expect(response.status).to.eqls(403);
        });

        it("wrong login name", async () => {
            const response = await supertest(app)
                .post("/api/management/user")
                .send({
                    displayName: null,
                })
                .set({ "admin-accesstoken": globals.adminToken });

            expect(response.status).to.eqls(400);
        });
    });

    describe("/api/management/user/:userId PUT", () => {
        it("Should work", async () => {
            const response = await supertest(app)
                .put(`/api/management/user/${globals.createdUser!.id}`)
                .send({
                    displayName: faker.name.firstName(),
                })
                .set({ "admin-accesstoken": globals.adminToken });

            globals.createdUser = response.body;
            expect(response.status).to.eqls(200);
        });

        it("Return 403 error", async () => {
            const response = await supertest(app)
                .put(`/api/management/user/${globals.createdUser!.id}`)
                .set({ "admin-accesstoken": "wrongtoken" });

            expect(response.status).to.eqls(403);
        });

        it("Should change only email", async () => {
            const newEmail = `${Utils.randomString(16)}@test.com`;

            const response = await supertest(app)
                .put(`/api/management/user/${globals.createdUser!.id}`)
                .send({
                    emailAddress: newEmail,
                })
                .set({ "admin-accesstoken": globals.adminToken });

            globals.createdUser = response.body;

            expect(response.status).to.eqls(200);
            expect(response.body.emailAddress).equals(newEmail);
        });
    });

    describe("/api/management/user/:id GET", () => {
        it("Should work", async () => {
            const response = await supertest(app)
                .get(`/api/management/user/${globals.createdUser!.id}`)
                .set({ "admin-accesstoken": globals.adminToken });

            expect(response.status).to.eqls(200);
        });
    });

    describe("/api/management/user GET", () => {
        it("Should work", async () => {
            const response = await supertest(app)
                .get(`/api/management/user`)
                .set({ "admin-accesstoken": globals.adminToken });

            expect(response.status).to.eqls(200);
            expect(response.body).to.be.an("object");
            expect(response.body.list).to.be.an("array");
            expect(response.body.count).to.be.an("number");
        });
    });

    describe("/api/management/user?page GET", () => {
        it("Should work", async () => {
            const response = await supertest(app)
                .get(`/api/management/user?page=1`)
                .set({ "admin-accesstoken": globals.adminToken });

            expect(response.status).to.eqls(200);
            expect(response.body).to.be.an("object");
            expect(response.body.list).to.be.an("array");
            expect(response.body.count).to.be.an("number");
        });
    });

    describe("/api/management/user/:id DELETE", () => {
        it("Should work", async () => {
            const response = await supertest(app)
                .delete(`/api/management/user/${globals.createdUser!.id}`)
                .set({ "admin-accesstoken": globals.adminToken });

            expect(response.status).to.eqls(200);
        });
    });
});
