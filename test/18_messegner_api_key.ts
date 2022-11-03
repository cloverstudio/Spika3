import { Room, ApiKey } from "@prisma/client";
import { expect } from "chai";
import supertest from "supertest";
import app from "../server";
import createFakeRoom from "./fixtures/room";
import createFakeApiKey from "./fixtures/apiKey";
import global from "./global";

describe("API", () => {
    let room: Room;

    before(async () => {
        room = await createFakeRoom([{ userId: global.userId, isAdmin: true }]);
    });

    describe("/api/messenger/api-keys/roomId/:roomId POST", () => {
        it("displayName is required", async () => {
            const invalidResponse = await supertest(app)
                .post(`/api/messenger/api-keys/roomId/${room.id}`)
                .set({ accesstoken: global.userToken })
                .send({ displayName: undefined });

            const validResponse = await supertest(app)
                .post(`/api/messenger/api-keys/roomId/${room.id}`)
                .set({ accesstoken: global.userToken })
                .send({ displayName: "Bot Beep Bop" });

            expect(invalidResponse.status).to.eqls(400);
            expect(validResponse.status).to.eqls(200);
        });

        it("User must be in room", async () => {
            const anotherRoom = await createFakeRoom([]);

            const response = await supertest(app)
                .post(`/api/messenger/api-keys/roomId/${anotherRoom.id}`)
                .set({ accesstoken: global.userToken })
                .send({ displayName: "Bot Beep Bop" });

            expect(response.status).to.eqls(403);
        });

        it("User must be admin", async () => {
            const anotherRoom = await createFakeRoom([{ userId: global.userId, isAdmin: false }]);

            const response = await supertest(app)
                .post(`/api/messenger/api-keys/roomId/${anotherRoom.id}`)
                .set({ accesstoken: global.userToken })
                .send({ displayName: "Bot Beep Bop" });

            expect(response.status).to.eqls(403);
        });

        it("Api key is stored in db", async () => {
            const response = await supertest(app)
                .post(`/api/messenger/api-keys/roomId/${room.id}`)
                .set({ accesstoken: global.userToken })
                .send({ displayName: "Bot Beep Bop" });

            expect(response.status).to.eqls(200);
            expect(response.body.data).to.has.property("apiKey");

            const apiKey = await global.prisma.apiKey.findUnique({
                where: { id: response.body.data.apiKey.id },
            });

            expect(apiKey?.roomId).to.eqls(room.id);
        });

        it("Creates botUser for that api key", async () => {
            const response = await supertest(app)
                .post(`/api/messenger/api-keys/roomId/${room.id}`)
                .set({ accesstoken: global.userToken })
                .send({ displayName: "Bot Beep Bop" });

            expect(response.status).to.eqls(200);
            expect(response.body.data).to.has.property("apiKey");

            const apiKey = await global.prisma.apiKey.findUnique({
                where: { id: response.body.data.apiKey.id },
            });

            const botUser = await global.prisma.user.findUnique({
                where: { id: apiKey.userId },
            });

            expect(botUser?.displayName).to.eqls("Bot Beep Bop");
            expect(botUser?.isBot).to.eqls(true);
        });

        it("Inserts botUser in that room", async () => {
            const response = await supertest(app)
                .post(`/api/messenger/api-keys/roomId/${room.id}`)
                .set({ accesstoken: global.userToken })
                .send({ displayName: "Bot Beep Bop" });

            expect(response.status).to.eqls(200);
            expect(response.body.data).to.has.property("apiKey");

            const botRoomUser = await global.prisma.roomUser.findFirst({
                where: { userId: response.body.data.apiKey.userId, roomId: room.id },
            });

            expect(botRoomUser).is.not.null;
        });
    });

    describe("/api/messenger/api-keys/roomId/:roomId GET", () => {
        it("User must be in room", async () => {
            const anotherRoom = await createFakeRoom([]);

            const response = await supertest(app)
                .get(`/api/messenger/api-keys/roomId/${anotherRoom.id}`)
                .set({ accesstoken: global.userToken });

            expect(response.status).to.eqls(403);
        });

        it("User must be admin", async () => {
            const anotherRoom = await createFakeRoom([{ userId: global.userId, isAdmin: false }]);

            const response = await supertest(app)
                .get(`/api/messenger/api-keys/roomId/${anotherRoom.id}`)
                .set({ accesstoken: global.userToken });

            expect(response.status).to.eqls(403);
        });

        it("Return apiKey list", async () => {
            const response = await supertest(app)
                .get(`/api/messenger/api-keys/roomId/${room.id}`)
                .set({ accesstoken: global.userToken });

            expect(response.status).to.eqls(200);
            expect(response.body.data).to.has.property("apiKeys");
            expect(response.body.data.apiKeys).to.be.an("array");
            expect(response.body.data.apiKeys.length).to.be.greaterThan(0);
        });
    });

    describe("/api/messenger/api-keys/:id PUT", () => {
        let apiKey: ApiKey;

        before(async () => {
            apiKey = await createFakeApiKey(room.id);
        });

        it("displayName is required", async () => {
            const invalidResponse = await supertest(app)
                .put(`/api/messenger/api-keys/${apiKey.id}`)
                .set({ accesstoken: global.userToken })
                .send({ displayName: undefined });

            const validResponse = await supertest(app)
                .put(`/api/messenger/api-keys/${apiKey.id}`)
                .set({ accesstoken: global.userToken })
                .send({ displayName: "Bot Beep Bop" });

            expect(invalidResponse.status).to.eqls(400);
            expect(validResponse.status).to.eqls(200);
        });

        it("User must be in room", async () => {
            const anotherRoom = await createFakeRoom([]);
            const anotherApiKey = await createFakeApiKey(anotherRoom.id);

            const response = await supertest(app)
                .put(`/api/messenger/api-keys/${anotherApiKey.id}`)
                .set({ accesstoken: global.userToken })
                .send({ displayName: "Bot Beep Bop" });

            expect(response.status).to.eqls(403);
        });

        it("User must be admin", async () => {
            const anotherRoom = await createFakeRoom([{ userId: global.userId, isAdmin: false }]);
            const anotherApiKey = await createFakeApiKey(anotherRoom.id);

            const response = await supertest(app)
                .put(`/api/messenger/api-keys/${anotherApiKey.id}`)
                .set({ accesstoken: global.userToken })
                .send({ displayName: "Bot Beep Bop" });

            expect(response.status).to.eqls(403);
        });

        it("Update is stored in db", async () => {
            const response = await supertest(app)
                .put(`/api/messenger/api-keys/${apiKey.id}`)
                .set({ accesstoken: global.userToken })
                .send({ displayName: "Bot Beep Bop" });

            expect(response.status).to.eqls(200);
            expect(response.body.data).to.has.property("apiKey");

            const apiKeyFromDb = await global.prisma.apiKey.findUnique({
                where: { id: response.body.data.apiKey.id },
            });

            const botUser = await global.prisma.user.findUnique({
                where: { id: apiKeyFromDb.userId },
            });

            expect(botUser?.displayName).to.eqls("Bot Beep Bop");
        });
    });

    describe("/api/messenger/api-keys/:id DELETE", () => {
        let apiKey: ApiKey;

        before(async () => {
            apiKey = await createFakeApiKey(room.id);
        });

        it("User must be in room", async () => {
            const anotherRoom = await createFakeRoom([]);
            const anotherApiKey = await createFakeApiKey(anotherRoom.id);

            const response = await supertest(app)
                .delete(`/api/messenger/api-keys/${anotherApiKey.id}`)
                .set({ accesstoken: global.userToken });

            expect(response.status).to.eqls(403);
        });

        it("User must be an admin", async () => {
            const anotherRoom = await createFakeRoom([{ userId: global.userId, isAdmin: false }]);
            const anotherApiKey = await createFakeApiKey(anotherRoom.id);

            const response = await supertest(app)
                .delete(`/api/messenger/api-keys/${anotherApiKey.id}`)
                .set({ accesstoken: global.userToken });

            expect(response.status).to.eqls(403);
        });

        it("apiKey must exist", async () => {
            const response = await supertest(app)
                .delete("/api/messenger/api-keys/568854545")
                .set({ accesstoken: global.userToken });

            expect(response.status).to.eqls(404);
        });

        it("Deleted from db", async () => {
            const response = await supertest(app)
                .delete(`/api/messenger/api-keys/${apiKey.id}`)
                .set({ accesstoken: global.userToken });

            expect(response.status).to.eqls(200);

            const apiKeyFromDb = await global.prisma.apiKey.findUnique({
                where: { id: apiKey.id },
            });

            expect(apiKeyFromDb).to.be.null;
        });

        it("Bot is removed from room", async () => {
            const newApiKey = await createFakeApiKey(room.id);
            const response = await supertest(app)
                .delete(`/api/messenger/api-keys/${newApiKey.id}`)
                .set({ accesstoken: global.userToken });

            expect(response.status).to.eqls(200);

            const botRoomUser = await global.prisma.roomUser.findFirst({
                where: { userId: newApiKey.userId, roomId: newApiKey.roomId },
            });

            expect(botRoomUser).to.be.null;
        });
    });
});
