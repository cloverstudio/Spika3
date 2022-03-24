import chai, { expect } from "chai";

import supertest from "supertest";
import app from "../server";
import globals from "./global";
import * as Constants from "../server/components/consts";
import createFakeRoom from "./fixtures/room";
import createFakeMessage from "./fixtures/message";
import { before, beforeEach, afterEach } from "mocha";
import { Room, Message } from ".prisma/client";
import createFakeDevice, { createFakeDevices } from "./fixtures/device";
import createFakeUser, { createManyFakeUsers } from "./fixtures/user";
import sendPush from "../server/services/push/worker/sendPush";
import { wait } from "../client/lib/utils";
import sanitize from "../server/components/sanitize";

describe("API", () => {
    describe("/api/messenger/messages POST", () => {
        let validParams: any = {};
        let room: Room | undefined;

        before(async () => {
            room = await createFakeRoom([{ userId: globals.userId, isAdmin: true }]);
        });

        afterEach(() => {
            chai.spy.restore(sendPush, "run");
        });

        beforeEach(async () => {
            validParams = {
                roomId: room.id,
                type: "type",
                message: {
                    text: "text",
                    mediaUrl: "url",
                },
            };
            chai.spy.on(sendPush, "run", () => true);
        });

        it("roomId param is required", async () => {
            const responseInvalid = await supertest(app)
                .post("/api/messenger/messages")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, roomId: undefined });

            const response = await supertest(app)
                .post("/api/messenger/messages")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, roomId: room.id });

            expect(responseInvalid.status).to.eqls(400);
            expect(response.status).to.eqls(200);
        });

        it("roomId param can be only number", async () => {
            const responseInvalid = await supertest(app)
                .post("/api/messenger/messages")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, roomId: [42] });

            const responseInvalidString = await supertest(app)
                .post("/api/messenger/messages")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, roomId: "notNum" });

            expect(responseInvalid.status).to.eqls(400);
            expect(responseInvalidString.status).to.eqls(400);
        });

        it("returns error if room with given id doesn't exist", async () => {
            const responseInvalid = await supertest(app)
                .post("/api/messenger/messages")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, roomId: 42080 });

            expect(responseInvalid.status).to.eqls(400);
        });

        it("type param is required", async () => {
            const responseInvalid = await supertest(app)
                .post("/api/messenger/messages")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, type: undefined });

            const responseValid = await supertest(app)
                .post("/api/messenger/messages")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, type: "string" });

            expect(responseInvalid.status).to.eqls(400);
            expect(responseValid.status).to.eqls(200);
        });

        it("type param can only be string", async () => {
            const responseInvalidOne = await supertest(app)
                .post("/api/messenger/messages")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, type: true });

            const responseInvalidTwo = await supertest(app)
                .post("/api/messenger/messages")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, type: [1] });

            const responseValid = await supertest(app)
                .post("/api/messenger/messages")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, type: "type" });

            expect(responseInvalidOne.status).to.eqls(400);
            expect(responseInvalidTwo.status).to.eqls(400);
            expect(responseValid.status).to.eqls(200);
        });

        it("creates message model", async () => {
            const response = await supertest(app)
                .post("/api/messenger/messages")
                .set({ accesstoken: globals.userToken })
                .send(validParams);

            expect(response.status).to.eqls(200);
            expect(response.body).to.has.property("data");
            expect(response.body.data).to.has.property("message");

            const { body: _, ...messageFromResponse } = response.body.data.message;
            const messageFromDb = await globals.prisma.message.findUnique({
                where: { id: messageFromResponse.id },
            });

            expect(JSON.stringify(messageFromResponse)).to.eqls(
                JSON.stringify(sanitize(messageFromDb).message())
            );
        });

        it("creates deviceMessage for every users device", async () => {
            const users = await createManyFakeUsers(2);
            const userIds = users.map((u) => u.id);
            await createFakeDevices(userIds);
            const room = await createFakeRoom([
                { userId: globals.userId, isAdmin: true },
                ...users.map((u) => ({ userId: u.id })),
            ]);

            const response = await supertest(app)
                .post("/api/messenger/messages")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, roomId: room.id });

            expect(response.status).to.eqls(200);
            expect(response.body).to.has.property("data");
            expect(response.body.data).to.has.property("message");

            // this is because we create device messages after we send response
            await wait(0.05);

            const message = response.body.data.message;
            const devices = await globals.prisma.device.findMany({
                where: { userId: { in: [...userIds, globals.userId] } },
            });
            const deviceIds = devices.map((d) => d.id);

            const deviceMessages = await globals.prisma.deviceMessage.findMany({
                where: { messageId: message.id },
            });
            const deviceMessageIds = deviceMessages.map((d) => d.deviceId);

            expect(deviceMessageIds).to.include.members(deviceIds);
            expect(message.totalDeviceCount).to.eqls(devices.length);
        });

        it("generates totalUserCount that is equal to number of users", async () => {
            const users = await createManyFakeUsers(2);

            const room = await createFakeRoom([
                { userId: globals.userId, isAdmin: true },
                ...users.map((u) => ({ userId: u.id })),
            ]);

            const response = await supertest(app)
                .post("/api/messenger/messages")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, roomId: room.id });

            expect(response.status).to.eqls(200);
            expect(response.body).to.has.property("data");
            expect(response.body.data).to.has.property("message");

            // this is because we create device messages after we send response
            await wait(0.05);

            const message = response.body.data.message;
            expect(message.totalUserCount).to.eqls(3);
        });

        it("every deviceMessage contains info about sender", async () => {
            const users = await createManyFakeUsers(2);
            const userIds = users.map((u) => u.id);
            await createFakeDevices(userIds);
            const room = await createFakeRoom([
                { userId: globals.userId, isAdmin: true },
                ...users.map((u) => ({ userId: u.id })),
            ]);

            const response = await supertest(app)
                .post("/api/messenger/messages")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, roomId: room.id });

            expect(response.status).to.eqls(200);
            expect(response.body).to.has.property("data");
            expect(response.body.data).to.has.property("message");

            await wait(0.05);

            const message = response.body.data.message;
            const deviceMessages = await globals.prisma.deviceMessage.findMany({
                where: { messageId: message.id },
            });
            const fromDevice = await globals.prisma.device.findFirst({
                where: { userId: globals.userId },
            });

            expect(
                deviceMessages.every(
                    (dm) => dm.fromUserId === globals.userId && dm.fromDeviceId === fromDevice.id
                )
            ).to.eqls(true);
        });

        it("every deviceMessage contains body", async () => {
            const users = await createManyFakeUsers(2);
            const userIds = users.map((u) => u.id);
            await createFakeDevices(userIds);
            const room = await createFakeRoom([
                { userId: globals.userId, isAdmin: true },
                ...users.map((u) => ({ userId: u.id })),
            ]);

            const response = await supertest(app)
                .post("/api/messenger/messages")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, roomId: room.id });

            expect(response.status).to.eqls(200);
            expect(response.body).to.has.property("data");
            expect(response.body.data).to.has.property("message");

            await wait(0.05);

            const message = response.body.data.message;
            const deviceMessages = await globals.prisma.deviceMessage.findMany({
                where: { messageId: message.id },
            });
            const messageBodies = deviceMessages.map((dm) => dm.body);

            expect(
                messageBodies.every(
                    (m: any) =>
                        m.text === validParams.message.text &&
                        m.mediaUrl === validParams.message.mediaUrl
                )
            ).to.eqls(true);
        });

        it("every deviceMessage contains action", async () => {
            const users = await createManyFakeUsers(2);
            const userIds = users.map((u) => u.id);
            await createFakeDevices(userIds);
            const room = await createFakeRoom([
                { userId: globals.userId, isAdmin: true },
                ...users.map((u) => ({ userId: u.id })),
            ]);

            const response = await supertest(app)
                .post("/api/messenger/messages")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, roomId: room.id });

            expect(response.status).to.eqls(200);
            expect(response.body).to.has.property("data");
            expect(response.body.data).to.has.property("message");

            await wait(0.05);

            const message = response.body.data.message;
            const deviceMessages = await globals.prisma.deviceMessage.findMany({
                where: { messageId: message.id },
            });
            const actions = deviceMessages.map((dm) => dm.action);

            expect(
                actions.every((a: string) => a === Constants.MESSAGE_ACTION_NEW_MESSAGE)
            ).to.eqls(true);
        });

        it("sends  push for every deviceMessage", async () => {
            const users = await createManyFakeUsers(2);
            const userIds = users.map((u) => u.id);
            await createFakeDevices(userIds);
            const room = await createFakeRoom([
                { userId: globals.userId, isAdmin: true },
                ...users.map((u) => ({ userId: u.id })),
            ]);

            const response = await supertest(app)
                .post("/api/messenger/messages")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, roomId: room.id });

            expect(response.status).to.eqls(200);
            expect(response.body).to.has.property("data");
            expect(response.body.data).to.has.property("message");

            await wait(0.05);

            const message = response.body.data.message;
            const deviceMessagesCount = await globals.prisma.deviceMessage.count({
                where: { messageId: message.id },
            });

            expect(sendPush.run).to.have.been.called.min(deviceMessagesCount);
        });
    });

    describe("/api/messenger/messages/:roomId/seen POST", () => {
        let room: Room | undefined;

        before(async () => {
            room = await createFakeRoom([{ userId: globals.userId, isAdmin: true }]);
        });

        it("roomId param must be number", async () => {
            const responseInvalid = await supertest(app)
                .post("/api/messenger/messages/invalid/seen")
                .set({ accesstoken: globals.userToken });

            const response = await supertest(app)
                .post(`/api/messenger/messages/${room.id}/seen`)
                .set({ accesstoken: globals.userToken });

            expect(responseInvalid.status).to.eqls(400);
            expect(response.status).to.eqls(200);
        });

        it("room must exist with given roomId", async () => {
            const responseInvalid = await supertest(app)
                .post("/api/messenger/messages/456464368/seen")
                .set({ accesstoken: globals.userToken });

            const response = await supertest(app)
                .post(`/api/messenger/messages/${room.id}/seen`)
                .set({ accesstoken: globals.userToken });

            expect(responseInvalid.status).to.eqls(400);
            expect(response.status).to.eqls(200);
        });

        it("user must be in that room", async () => {
            const roomTwo = await createFakeRoom([]);
            const responseInvalid = await supertest(app)
                .post(`/api/messenger/messages/${roomTwo.id}/seen`)
                .set({ accesstoken: globals.userToken });

            const response = await supertest(app)
                .post(`/api/messenger/messages/${room.id}/seen`)
                .set({ accesstoken: globals.userToken });

            expect(responseInvalid.status).to.eqls(400);
            expect(response.status).to.eqls(200);
        });

        it("marks all messages in room as seen", async () => {
            const messageOne = await createFakeMessage({
                fromUserId: globals.userId,
                room,
                fromDeviceId: globals.deviceId,
            });

            const messageTwo = await createFakeMessage({
                fromUserId: globals.userId,
                room,
                fromDeviceId: globals.deviceId,
            });

            const response = await supertest(app)
                .post(`/api/messenger/messages/${room.id}/seen`)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(200);

            const messageRecords = await globals.prisma.messageRecord.findMany({
                where: {
                    messageId: { in: [messageOne.id, messageTwo.id] },
                    userId: globals.userId,
                },
            });

            expect(messageRecords.every((mr) => mr.type === "seen")).to.be.true;
        });

        it("doesn't mark messages that are created before user joined room", async () => {
            const newRoom = await createFakeRoom([]);

            const messageOne = await createFakeMessage({
                fromUserId: globals.userId,
                room: newRoom,
                fromDeviceId: globals.deviceId,
            });

            await globals.prisma.roomUser.create({
                data: { userId: globals.userId, roomId: newRoom.id },
            });

            const messageTwo = await createFakeMessage({
                fromUserId: globals.userId,
                room: newRoom,
                fromDeviceId: globals.deviceId,
            });

            const response = await supertest(app)
                .post(`/api/messenger/messages/${newRoom.id}/seen`)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(200);

            const messageOneRecords = await globals.prisma.messageRecord.findMany({
                where: {
                    message: messageOne,
                    userId: globals.userId,
                },
            });

            expect(messageOneRecords).to.be.lengthOf(0);

            const messageTwoRecords = await globals.prisma.messageRecord.findMany({
                where: {
                    message: messageTwo,
                    userId: globals.userId,
                },
            });

            expect(messageTwoRecords.every((mr) => mr.type === "seen")).to.be.true;
        });
    });

    describe("/api/messenger/messages/:messageId/delivered POST", () => {
        let message: Message | undefined;

        before(async () => {
            const room = await createFakeRoom([{ userId: globals.userId, isAdmin: true }]);
            message = await createFakeMessage({
                fromUserId: globals.userId,
                room,
                fromDeviceId: globals.deviceId,
            });
        });

        it("messageId param must be number", async () => {
            const responseInvalid = await supertest(app)
                .post("/api/messenger/messages/invalid/delivered")
                .set({ accesstoken: globals.userToken });

            const response = await supertest(app)
                .post(`/api/messenger/messages/${message.id}/delivered`)
                .set({ accesstoken: globals.userToken });

            expect(responseInvalid.status).to.eqls(400);
            expect(response.status).to.eqls(200);
        });

        it("message must exist with given messageId", async () => {
            const responseInvalid = await supertest(app)
                .post("/api/messenger/messages/456464368/delivered")
                .set({ accesstoken: globals.userToken });

            const response = await supertest(app)
                .post(`/api/messenger/messages/${message.id}/delivered`)
                .set({ accesstoken: globals.userToken });

            expect(responseInvalid.status).to.eqls(404);
            expect(response.status).to.eqls(200);
        });

        it("user must be in that messages room", async () => {
            const roomTwo = await createFakeRoom([]);
            const messageTwo = await createFakeMessage({
                fromUserId: globals.userId,
                room: roomTwo,
                fromDeviceId: globals.deviceId,
            });

            const responseInvalid = await supertest(app)
                .post(`/api/messenger/messages/${messageTwo.id}/delivered`)
                .set({ accesstoken: globals.userToken });

            const response = await supertest(app)
                .post(`/api/messenger/messages/${message.id}/delivered`)
                .set({ accesstoken: globals.userToken });

            expect(responseInvalid.status).to.eqls(404);
            expect(response.status).to.eqls(200);
        });

        it("marks message as delivered", async () => {
            const response = await supertest(app)
                .post(`/api/messenger/messages/${message.id}/delivered`)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(200);

            const messageRecords = await globals.prisma.messageRecord.findMany({
                where: {
                    message: message,
                    userId: globals.userId,
                    type: "delivered",
                },
            });

            expect(messageRecords).to.be.lengthOf(1);
        });

        it("is idempotent", async () => {
            const response = await supertest(app)
                .post(`/api/messenger/messages/${message.id}/delivered`)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(200);

            const messageRecords = await globals.prisma.messageRecord.findMany({
                where: {
                    message: message,
                    userId: globals.userId,
                    type: "delivered",
                },
            });

            expect(messageRecords).to.be.lengthOf(1);
        });
    });

    describe("/api/messenger/messages/:timestamp GET", () => {
        it("timestamp param must be number", async () => {
            const responseInvalid = await supertest(app)
                .get("/api/messenger/messages/invalid")
                .set({ accesstoken: globals.userToken });

            const response = await supertest(app)
                .get(`/api/messenger/messages/${+Date.now()}`)
                .set({ accesstoken: globals.userToken });

            expect(responseInvalid.status).to.eqls(400);
            expect(response.status).to.eqls(200);
        });

        it("gets messages that are created after timestamp", async () => {
            const responseOne = await supertest(app)
                .get(`/api/messenger/messages/${+Date.now()}`)
                .set({ accesstoken: globals.userToken });

            expect(responseOne.status).to.eqls(200);
            expect(responseOne.body).to.has.property("data");
            expect(responseOne.body.data).to.has.property("list");
            expect(responseOne.body.data).to.has.property("count");
            expect(responseOne.body.data.list).to.have.lengthOf(0);
            expect(responseOne.body.data.count).to.eqls(0);

            const user = await createFakeUser();
            const device = await createFakeDevice(user.id);
            const room = await createFakeRoom([
                { userId: globals.userId, isAdmin: true },
                { userId: user.id },
            ]);

            const timestamp = +new Date();

            const messages = await Promise.all(
                new Array(18).fill(true).map(() =>
                    createFakeMessage({
                        fromUserId: user.id,
                        room,
                        fromDeviceId: device.id,
                    })
                )
            );

            const responseTwo = await supertest(app)
                .get(`/api/messenger/messages/${timestamp}`)
                .set({ accesstoken: globals.userToken });

            expect(responseTwo.status).to.eqls(200);
            expect(responseTwo.body).to.has.property("data");
            expect(responseTwo.body.data).to.has.property("list");
            expect(responseTwo.body.data).to.has.property("count");
            expect(responseTwo.body.data.list).to.have.lengthOf(Constants.PAGING_LIMIT);
            expect(responseTwo.body.data.count).to.eqls(messages.length);
        });

        it("flags sent messages as delivered", async () => {
            const user = await createFakeUser();
            const device = await createFakeDevice(user.id);
            const room = await createFakeRoom([
                { userId: globals.userId, isAdmin: true },
                { userId: user.id },
            ]);

            const timestamp = +new Date();

            const messages = await Promise.all(
                new Array(18).fill(true).map(() =>
                    createFakeMessage({
                        fromUserId: user.id,
                        room,
                        fromDeviceId: device.id,
                    })
                )
            );

            const response = await supertest(app)
                .get(`/api/messenger/messages/${timestamp}`)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(200);

            const responseMessages = response.body.data.list as Message[];

            const messageRecords = await globals.prisma.messageRecord.findMany({
                where: {
                    userId: globals.userId,
                    type: "delivered",
                    messageId: { in: responseMessages.map((m) => m.id) },
                },
            });

            expect(messageRecords).to.have.lengthOf(responseMessages.length);
        });
    });
});
