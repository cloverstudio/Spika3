import { expect } from "chai";
import { before, beforeEach } from "mocha";
import supertest from "supertest";
import app from "../server";
import globals from "./global";
import createFakeRoom from "./fixtures/room";
import createFakeMessage from "./fixtures/message";
import createFakeMessageRecord from "./fixtures/messageRecord";
import { Room, MessageRecord } from ".prisma/client";

describe("API", () => {
    describe("/api/messenger/message-record POST", () => {
        let validParams: any = {};
        let room: Room | undefined;

        before(async () => {
            room = await createFakeRoom([{ userId: globals.userId, isAdmin: true }]);
        });

        beforeEach(async () => {
            const message = await createFakeMessage({
                fromUserId: globals.userId,
                fromDeviceId: globals.deviceId,
                room,
            });

            validParams = {
                messageId: message.id,
                type: "delivered",
                userId: globals.userId,
            };
        });

        it("Requires messageId", async () => {
            const response = await supertest(app)
                .post("/api/messenger/message-records")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, messageId: undefined });
            expect(response.status).to.eqls(400);
        });

        it("Returns 404 if message doesn't exist", async () => {
            const response = await supertest(app)
                .post("/api/messenger/message-records")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, messageId: 165168485413514 });

            expect(response.status).to.eqls(404);
        });

        it("Requires valid type", async () => {
            const response = await supertest(app)
                .post("/api/messenger/message-records")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, type: "invalid" });
            expect(response.status).to.eqls(400);
        });

        it("Requires type", async () => {
            const response = await supertest(app)
                .post("/api/messenger/message-records")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, type: undefined });
            expect(response.status).to.eqls(400);
        });

        it("Requires reaction if type='reaction'", async () => {
            const responseInvalid = await supertest(app)
                .post("/api/messenger/message-records")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, type: "reaction" });
            expect(responseInvalid.status).to.eqls(400);

            const responseValid = await supertest(app)
                .post("/api/messenger/message-records")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, type: "reaction", reaction: "U+1F604" });
            expect(responseValid.status).to.eqls(200);
        });

        it("Saves messageRecord in db", async () => {
            const response = await supertest(app)
                .post("/api/messenger/message-records")
                .set({ accesstoken: globals.userToken })
                .send(validParams);
            expect(response.status).to.eqls(200);
            expect(response.body.data).to.has.property("messageRecord");

            const mrFromDb = await globals.prisma.messageRecord.findUnique({
                where: { id: response.body.data.messageRecord.id },
            });

            expect(mrFromDb.type).to.eqls(validParams.type);
            expect(mrFromDb.userId).to.eqls(validParams.userId);
            expect(mrFromDb.messageId).to.eqls(validParams.messageId);
        });
    });

    describe("/api/messenger/message-record/:id DELETE", () => {
        let messageRecord: MessageRecord | undefined;

        beforeEach(async () => {
            const room = await createFakeRoom([{ userId: globals.userId, isAdmin: true }]);
            const message = await createFakeMessage({
                fromUserId: globals.userId,
                fromDeviceId: globals.deviceId,
                room,
            });

            messageRecord = await createFakeMessageRecord({
                userId: globals.userId,
                messageId: message.id,
                type: "reaction",
            });
        });

        it("Returns 404 if message doesn't exist", async () => {
            const response = await supertest(app)
                .delete("/api/messenger/message-records/165168485413514")
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(404);
        });

        it("Removes messageRecord from db", async () => {
            const response = await supertest(app)
                .delete("/api/messenger/message-records/" + messageRecord.id)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(200);
            expect(response.body.data).to.has.property("messageRecord");

            const mrFromDb = await globals.prisma.messageRecord.findUnique({
                where: { id: response.body.data.messageRecord.id },
            });

            expect(mrFromDb).to.eqls(null);
        });
    });

    describe("/api/messenger/message-records/sync/:lastUpdate POST", () => {
        it("Requires lastUpdate to be number", async () => {
            const response = await supertest(app)
                .get("/api/messenger/message-records/sync/abc58")
                .set({ accesstoken: globals.userToken });
            expect(response.status).to.eqls(400);
        });

        it("Returns messages records from lastUpdate", async () => {
            const lastUpdate = +new Date();

            const room = await createFakeRoom([{ userId: globals.userId, isAdmin: true }]);
            const message = await createFakeMessage({
                fromUserId: globals.userId,
                fromDeviceId: globals.deviceId,
                room,
            });

            const messageRecord = await globals.prisma.messageRecord.create({
                data: { messageId: message.id, userId: globals.userId, type: "delivered" },
            });

            const response = await supertest(app)
                .get("/api/messenger/message-records/sync/" + lastUpdate)
                .set({ accesstoken: globals.userToken });
            expect(response.status).to.eqls(200);
            expect(response.body.data).to.has.property("messageRecords");
            expect(response.body.data.messageRecords.some((m: any) => m.id === messageRecord.id)).to
                .be.true;
        });
    });
});
