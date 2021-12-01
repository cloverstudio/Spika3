import { expect } from "chai";
import supertest from "supertest";
import app from "../server";
import faker from "faker";
import globals from "./global";

describe("Admin room management API", () => {
    describe("/api/management/room POST", () => {
        it("Should work", async () => {
            const response = await supertest(app)
                .post("/api/management/room")
                .send({
                    name: faker.lorem.word(),
                    type: faker.lorem.word(),
                    avatarUrl: "",
                    deleted: false,
                })
                .set({ "admin-accesstoken": globals.adminToken });

            globals.createdRoom = response.body.data.room;
            expect(response.status).to.eqls(200);
        });

        it("Return 403 error", async () => {
            const response = await supertest(app)
                .post("/api/management/room")
                .set({ "admin-accesstoken": "wrongtoken" });

            expect(response.status).to.eqls(403);
        });

        it("wrong room name", async () => {
            const response = await supertest(app)
                .post("/api/management/room")
                .send({
                    name: null,
                })
                .set({ "admin-accesstoken": globals.adminToken });

            expect(response.status).to.eqls(400);
        });
    });

    describe("/api/management/room/:roomId PUT", () => {
        it("Should work", async () => {
            const response = await supertest(app)
                .put(`/api/management/room/${globals.createdRoom!.id}`)
                .send({
                    name: faker.lorem.word(),
                    type: faker.lorem.word(),
                    avatarUrl: "",
                    deleted: false,
                })
                .set({ "admin-accesstoken": globals.adminToken });

            globals.createdRoom = response.body.data.room;
            expect(response.status).to.eqls(200);
        });

        it("Return 403 error", async () => {
            const response = await supertest(app)
                .put(`/api/management/room/${globals.createdRoom!.id}`)
                .set({ "admin-accesstoken": "wrongtoken" });

            expect(response.status).to.eqls(403);
        });

        it("wrong room name", async () => {
            const response = await supertest(app)
                .post("/api/management/room")
                .send({
                    name: null,
                })
                .set({ "admin-accesstoken": globals.adminToken });

            expect(response.status).to.eqls(400);
        });
    });

    describe("/api/management/room/:roomId GET", () => {
        it("Should work", async () => {
            const response = await supertest(app)
                .get(`/api/management/room/${globals.createdRoom!.id}`)
                .set({ "admin-accesstoken": globals.adminToken });

            expect(response.status).to.eqls(200);
        });
    });

    describe("/api/management/room GET", () => {
        it("Should work", async () => {
            const response = await supertest(app)
                .get(`/api/management/room`)
                .set({ "admin-accesstoken": globals.adminToken });

            expect(response.status).to.eqls(200);
            expect(response.body.data).to.be.an("object");
            expect(response.body.data.list).to.be.an("array");
            expect(response.body.data.count).to.be.an("number");
        });
    });

    describe("/api/management/room?page GET", () => {
        it("Should work", async () => {
            const response = await supertest(app)
                .get(`/api/management/room?page=1`)
                .set({ "admin-accesstoken": globals.adminToken });

            expect(response.status).to.eqls(200);
            expect(response.body).to.be.an("object");
            expect(response.body.data.list).to.be.an("array");
            expect(response.body.data.count).to.be.an("number");
        });
    });

    describe("/api/management/room/:roomId DELETE", () => {
        it("Should work", async () => {
            const response = await supertest(app)
                .delete(`/api/management/room/${globals.createdRoom!.id}`)
                .set({ "admin-accesstoken": globals.adminToken });

            expect(response.status).to.eqls(200);
        });
    });
});
