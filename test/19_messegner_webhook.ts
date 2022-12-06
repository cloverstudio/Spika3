import { Webhook, Room } from "@prisma/client";
import { expect } from "chai";
import supertest from "supertest";
import app from "../server";
import createFakeWebhook from "./fixtures/webhook";
import createFakeRoom from "./fixtures/room";
import globals from "./global";

describe("API", () => {
    let room: Room;

    before(async () => {
        room = await createFakeRoom([{ userId: globals.userId, isAdmin: true }]);
    });

    describe("/api/messenger/webhooks/roomId/:roomId POST", () => {
        it("Url is required", async () => {
            const invalidResponse = await supertest(app)
                .post(`/api/messenger/webhooks/roomId/${room.id}`)
                .set({ accesstoken: globals.userToken })
                .send({ url: undefined });

            const validResponse = await supertest(app)
                .post(`/api/messenger/webhooks/roomId/${room.id}`)
                .set({ accesstoken: globals.userToken })
                .send({ url: "http://link.ba" });

            expect(invalidResponse.status).to.eqls(400);
            expect(validResponse.status).to.eqls(200);
        });

        it("Url must be valid", async () => {
            const invalidResponse = await supertest(app)
                .post(`/api/messenger/webhooks/roomId/${room.id}`)
                .set({ accesstoken: globals.userToken })
                .send({ url: "not valid" });

            const validResponse = await supertest(app)
                .post(`/api/messenger/webhooks/roomId/${room.id}`)
                .set({ accesstoken: globals.userToken })
                .send({ url: "http://link.ba" });

            expect(invalidResponse.status).to.eqls(400);
            expect(validResponse.status).to.eqls(200);
        });

        it("User must be in room", async () => {
            const anotherRoom = await createFakeRoom([]);

            const response = await supertest(app)
                .post(`/api/messenger/webhooks/roomId/${anotherRoom.id}`)
                .set({ accesstoken: globals.userToken })
                .send({ url: "http://link.ba" });

            expect(response.status).to.eqls(403);
        });

        it("User must be admin", async () => {
            const anotherRoom = await createFakeRoom([{ userId: globals.userId, isAdmin: false }]);

            const response = await supertest(app)
                .post(`/api/messenger/webhooks/roomId/${anotherRoom.id}`)
                .set({ accesstoken: globals.userToken })
                .send({ url: "http://link.ba" });

            expect(response.status).to.eqls(403);
        });

        it("Webhook is stored in db", async () => {
            const response = await supertest(app)
                .post(`/api/messenger/webhooks/roomId/${room.id}`)
                .set({ accesstoken: globals.userToken })
                .send({ url: "http://link.ba" });

            expect(response.status).to.eqls(200);
            expect(response.body.data).to.has.property("webhook");

            const webhook = await globals.prisma.webhook.findUnique({
                where: { id: response.body.data.webhook.id },
            });

            expect(webhook?.url).to.eqls("http://link.ba");
            expect(webhook?.roomId).to.eqls(room.id);
        });
    });

    describe("/api/messenger/webhooks/roomId/:roomId GET", () => {
        it("User must be in room", async () => {
            const anotherRoom = await createFakeRoom([]);

            const response = await supertest(app)
                .get(`/api/messenger/webhooks/roomId/${anotherRoom.id}`)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(403);
        });

        it("User must be admin", async () => {
            const anotherRoom = await createFakeRoom([{ userId: globals.userId, isAdmin: false }]);

            const response = await supertest(app)
                .get(`/api/messenger/webhooks/roomId/${anotherRoom.id}`)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(403);
        });

        it("Return webhook list", async () => {
            const response = await supertest(app)
                .get(`/api/messenger/webhooks/roomId/${room.id}`)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(200);
            expect(response.body.data).to.has.property("webhooks");
            expect(response.body.data.webhooks).to.be.an("array");
            expect(response.body.data.webhooks.length).to.be.greaterThan(0);
        });
    });

    describe("/api/messenger/webhooks/:id PUT", () => {
        let webhook: Webhook;

        before(async () => {
            webhook = await createFakeWebhook(room.id);
        });

        it("Url is required", async () => {
            const invalidResponse = await supertest(app)
                .put(`/api/messenger/webhooks/${webhook.id}`)
                .set({ accesstoken: globals.userToken })
                .send({ url: undefined });

            const validResponse = await supertest(app)
                .put(`/api/messenger/webhooks/${webhook.id}`)
                .set({ accesstoken: globals.userToken })
                .send({ url: "http://link.ba" });

            expect(invalidResponse.status).to.eqls(400);
            expect(validResponse.status).to.eqls(200);
        });

        it("Url must be valid", async () => {
            const invalidResponse = await supertest(app)
                .put(`/api/messenger/webhooks/${webhook.id}`)
                .set({ accesstoken: globals.userToken })
                .send({ url: "not valid" });

            const validResponse = await supertest(app)
                .put(`/api/messenger/webhooks/${webhook.id}`)
                .set({ accesstoken: globals.userToken })
                .send({ url: "http://link.ba" });

            expect(invalidResponse.status).to.eqls(400);
            expect(validResponse.status).to.eqls(200);
        });

        it("User must be in room", async () => {
            const anotherRoom = await createFakeRoom([]);
            const anotherWebhook = await createFakeWebhook(anotherRoom.id);

            const response = await supertest(app)
                .put(`/api/messenger/webhooks/${anotherWebhook.id}`)
                .set({ accesstoken: globals.userToken })
                .send({ url: "http://link.ba" });

            expect(response.status).to.eqls(403);
        });

        it("User must be admin", async () => {
            const anotherRoom = await createFakeRoom([{ userId: globals.userId, isAdmin: false }]);
            const anotherWebhook = await createFakeWebhook(anotherRoom.id);

            const response = await supertest(app)
                .put(`/api/messenger/webhooks/${anotherWebhook.id}`)
                .set({ accesstoken: globals.userToken })
                .send({ url: "http://link.ba" });

            expect(response.status).to.eqls(403);
        });

        it("Update is stored in db", async () => {
            const response = await supertest(app)
                .put(`/api/messenger/webhooks/${webhook.id}`)
                .set({ accesstoken: globals.userToken })
                .send({ url: "http://link.ba" });

            expect(response.status).to.eqls(200);
            expect(response.body.data).to.has.property("webhook");

            const webhookFromDb = await globals.prisma.webhook.findUnique({
                where: { id: response.body.data.webhook.id },
            });

            expect(webhookFromDb?.url).to.eqls("http://link.ba");
        });
    });

    describe("/api/messenger/webhooks/:id DELETE", () => {
        let webhook: Webhook;

        before(async () => {
            webhook = await createFakeWebhook(room.id);
        });

        it("User must be in room", async () => {
            const anotherRoom = await createFakeRoom([]);
            const anotherWebhook = await createFakeWebhook(anotherRoom.id);

            const response = await supertest(app)
                .delete(`/api/messenger/webhooks/${anotherWebhook.id}`)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(403);
        });

        it("User must be an admin", async () => {
            const anotherRoom = await createFakeRoom([{ userId: globals.userId, isAdmin: false }]);
            const anotherWebhook = await createFakeWebhook(anotherRoom.id);

            const response = await supertest(app)
                .delete(`/api/messenger/webhooks/${anotherWebhook.id}`)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(403);
        });

        it("Webhook must exist", async () => {
            const response = await supertest(app)
                .delete("/api/messenger/webhooks/568854545")
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(404);
        });

        it("Deleted from db", async () => {
            const response = await supertest(app)
                .delete(`/api/messenger/webhooks/${webhook.id}`)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(200);

            const webhookFromDb = await globals.prisma.webhook.findUnique({
                where: { id: webhook.id },
            });

            expect(webhookFromDb).to.be.null;
        });
    });
});
