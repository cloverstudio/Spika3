import chai, { expect } from "chai";

import supertest from "supertest";
import app from "../server";
import globals from "./global";
import * as Constants from "../server/components/consts";
import createFakeRoom from "./fixtures/room";
import createFakeMessage from "./fixtures/message";
import { before, beforeEach, afterEach } from "mocha";
import { Room, Message, MessageRecord } from ".prisma/client";
import createFakeDevice, { createFakeDevices } from "./fixtures/device";
import createFakeUser, { createManyFakeUsers } from "./fixtures/user";
import sendPush from "../server/services/push/worker/sendPush";
import utils from "../server/components/utils";
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
                type: "text",
                body: {
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
                .send({ ...validParams, type: "text" });

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
                .send({ ...validParams, type: "text" });

            expect(responseInvalidOne.status).to.eqls(400);
            expect(responseInvalidTwo.status).to.eqls(400);
            expect(responseValid.status).to.eqls(200);
        });

        it("requires room to not be deleted", async () => {
            const room = await createFakeRoom([{ userId: globals.userId, isAdmin: true }], {
                deleted: true,
            });
            const response = await supertest(app)
                .post("/api/messenger/messages")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, roomId: room.id });

            expect(response.status).to.eqls(403);
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
            await utils.wait(0.05);

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
            await utils.wait(0.05);

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

            await utils.wait(0.05);

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

            await utils.wait(0.05);

            const message = response.body.data.message;
            const deviceMessages = await globals.prisma.deviceMessage.findMany({
                where: { messageId: message.id },
            });
            const messageBodies = deviceMessages.map((dm) => dm.body);

            expect(
                messageBodies.every(
                    (m: any) =>
                        m.text === validParams.body.text && m.mediaUrl === validParams.body.mediaUrl
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

            await utils.wait(0.05);

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

            await utils.wait(0.1);

            const message = response.body.data.message;
            const deviceMessagesCount = await globals.prisma.deviceMessage.count({
                where: { messageId: message.id },
            });

            // -1 is because we don't send push to user who send the message
            expect(sendPush.run).to.have.been.called.min(deviceMessagesCount - 1);
        });

        it("if message is reply it requires valid replyId", async () => {
            const responseInvalidOne = await supertest(app)
                .post("/api/messenger/messages")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, replyId: true });

            const responseInvalidTwo = await supertest(app)
                .post("/api/messenger/messages")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, replyId: 589878855488751 });

            const referenceMessage = await createFakeMessage({
                room,
                fromUserId: globals.userId,
                fromDeviceId: globals.deviceId,
            });

            const responseInvalidThree = await supertest(app)
                .post("/api/messenger/messages")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, replyId: referenceMessage.id, body: {} });

            const response = await supertest(app)
                .post("/api/messenger/messages")
                .set({ accesstoken: globals.userToken })
                .send({
                    ...validParams,
                    replyId: referenceMessage.id,
                    body: { text: "foo" },
                });

            expect(responseInvalidOne.status).to.eqls(400);
            expect(responseInvalidTwo.status).to.eqls(400);
            expect(responseInvalidThree.status).to.eqls(400);
            expect(response.status).to.eqls(200);
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

            await utils.wait(0.2);

            const messageRecords = await globals.prisma.messageRecord.findMany({
                where: {
                    messageId: { in: [messageOne.id, messageTwo.id] },
                    userId: globals.userId,
                },
            });

            expect(messageRecords.filter((mr) => mr.type === "seen")).to.have.lengthOf(2);
        });

        it("marks all messages in room as delivered", async () => {
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
                .post(`/api/messenger/messages/delivered`)
                .set({ accesstoken: globals.userToken })
                .send({ messagesIds: [messageOne.id, messageTwo.id] });

            expect(response.status).to.eqls(200);

            await utils.wait(0.2);

            const messageRecords = await globals.prisma.messageRecord.findMany({
                where: {
                    messageId: { in: [messageOne.id, messageTwo.id] },
                    userId: globals.userId,
                },
            });

            console.log(messageRecords);
            expect(messageRecords.filter((mr) => mr.type === "delivered")).to.have.lengthOf(2);
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

    describe("/api/messenger/messages/delivered POST", () => {
        let messages: Message[];

        before(async () => {
            const room = await createFakeRoom([{ userId: globals.userId, isAdmin: true }]);
            messages = await Promise.all(
                new Array(6).fill(true).map(() =>
                    createFakeMessage({
                        fromUserId: globals.userId,
                        room,
                        fromDeviceId: globals.deviceId,
                    })
                )
            );
        });

        it("messagesIds param must be array", async () => {
            const responseInvalid = await supertest(app)
                .post("/api/messenger/messages/delivered")
                .set({ accesstoken: globals.userToken })
                .send({ messagesIds: undefined });

            const response = await supertest(app)
                .post("/api/messenger/messages/delivered")
                .set({ accesstoken: globals.userToken })
                .send({ messagesIds: messages.map((m) => m.id) });

            expect(responseInvalid.status).to.eqls(400);
            expect(response.status).to.eqls(200);
        });

        it("messages must exist with given id", async () => {
            const responseInvalid = await supertest(app)
                .post("/api/messenger/messages/delivered")
                .set({ accesstoken: globals.userToken })
                .send({ messagesIds: [256874] });

            const response = await supertest(app)
                .post("/api/messenger/messages/delivered")
                .set({ accesstoken: globals.userToken })
                .send({ messagesIds: messages.map((m) => m.id) });

            expect(responseInvalid.status).to.eqls(400);
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
                .post(`/api/messenger/messages/delivered`)
                .set({ accesstoken: globals.userToken })
                .send({ messagesIds: [messageTwo.id] });

            const response = await supertest(app)
                .post("/api/messenger/messages/delivered")
                .set({ accesstoken: globals.userToken })
                .send({ messagesIds: messages.map((m) => m.id) });

            expect(responseInvalid.status).to.eqls(400);
            expect(response.status).to.eqls(200);
        });

        it("marks messages as delivered", async () => {
            const response = await supertest(app)
                .post("/api/messenger/messages/delivered")
                .set({ accesstoken: globals.userToken })
                .send({ messagesIds: messages.map((m) => m.id) });

            expect(response.status).to.eqls(200);

            await utils.wait(0.1);

            const messageRecords = await globals.prisma.messageRecord.findMany({
                where: {
                    messageId: { in: messages.map((m) => m.id) },
                    userId: globals.userId,
                    type: "delivered",
                },
            });

            expect(messageRecords).to.be.lengthOf(messages.length);
        });

        it("updates message deliveredCount", async () => {
            const response = await supertest(app)
                .post("/api/messenger/messages/delivered")
                .set({ accesstoken: globals.userToken })
                .send({ messagesIds: messages.map((m) => m.id) });

            expect(response.status).to.eqls(200);

            const updatedMessages = await globals.prisma.message.findMany({
                where: { id: { in: messages.map((m) => m.id) } },
            });

            expect(updatedMessages.every((m) => m.deliveredCount === 1)).to.be.true;
        });
    });

    describe("/api/messenger/messages/:id/message-records GET", () => {
        let messages: Message[];

        before(async () => {
            const room = await createFakeRoom([{ userId: globals.userId, isAdmin: true }]);
            messages = await Promise.all(
                new Array(6).fill(true).map(() =>
                    createFakeMessage({
                        fromUserId: globals.userId,
                        room,
                        fromDeviceId: globals.deviceId,
                    })
                )
            );
        });

        it("return 404 if message doesn't exists", async () => {
            const responseInvalid = await supertest(app)
                .get("/api/messenger/messages/2568752/message-records")
                .set({ accesstoken: globals.userToken });

            const response = await supertest(app)
                .get(`/api/messenger/messages/${messages[0].id}/message-records`)
                .set({ accesstoken: globals.userToken });

            expect(responseInvalid.status).to.eqls(404);
            expect(response.status).to.eqls(200);
        });

        it("return 404 if user is not in messages room", async () => {
            const room = await createFakeRoom([]);
            const message = await createFakeMessage({
                fromUserId: globals.userId,
                room,
                fromDeviceId: globals.deviceId,
            });

            const responseInvalid = await supertest(app)
                .get(`/api/messenger/messages/${message.id}/message-records`)
                .set({ accesstoken: globals.userToken });

            const response = await supertest(app)
                .get(`/api/messenger/messages/${messages[0].id}/message-records`)
                .set({ accesstoken: globals.userToken });

            expect(responseInvalid.status).to.eqls(404);
            expect(response.status).to.eqls(200);
        });

        it("returns messages records", async () => {
            const record = await globals.prisma.messageRecord.create({
                data: {
                    messageId: messages[0].id,
                    userId: globals.userId,
                    type: "seen",
                },
            });
            const response = await supertest(app)
                .get(`/api/messenger/messages/${messages[0].id}/message-records`)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(200);
            expect(response.body).to.has.property("data");
            expect(response.body.data).to.has.property("messageRecords");
            expect(response.body.data.messageRecords).to.be.an("array");
            expect(
                response.body.data.messageRecords.filter((r: MessageRecord) => r.id === record.id)
            ).to.have.lengthOf(1);
        });
    });

    describe("/api/messenger/messages/sync/:lastUpdate GET", () => {
        it("Requires lastUpdate to be number", async () => {
            const response = await supertest(app)
                .get("/api/messenger/messages/sync/abc58")
                .set({ accesstoken: globals.userToken });
            expect(response.status).to.eqls(400);
        });

        it("Returns messages from lastUpdate", async () => {
            const lastUpdate = +new Date();

            const user = await createFakeUser();
            const device = await createFakeDevice(user.id);
            const room = await createFakeRoom([
                { userId: globals.userId, isAdmin: true },
                { userId: user.id },
            ]);

            const messages = await Promise.all(
                new Array(18).fill(true).map(() =>
                    createFakeMessage({
                        fromUserId: user.id,
                        room,
                        fromDeviceId: device.id,
                    })
                )
            );

            const olderMessages = await Promise.all(
                new Array(18).fill(true).map(() =>
                    createFakeMessage({
                        fromUserId: user.id,
                        room,
                        fromDeviceId: device.id,
                        modifiedAt: new Date(+new Date() - 10000),
                    })
                )
            );

            const response = await supertest(app)
                .get("/api/messenger/messages/sync/" + lastUpdate)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(200);
            expect(response.body).to.has.property("data");
            expect(response.body.data).to.has.property("messages");
            expect(
                messages.every((m) => response.body.data.messages.find((bm: any) => bm.id === m.id))
            ).to.be.true;
            expect(
                olderMessages.every(
                    (m) => !response.body.data.messages.find((bm: any) => bm.id === m.id)
                )
            ).to.be.true;
        });
    });

    describe("/api/messenger/messages/:id DELETE", () => {
        let room: Room;

        before(async () => {
            room = await createFakeRoom([{ userId: globals.userId, isAdmin: true }]);
        });

        it("requires target to be all or user", async () => {
            const message = await createFakeMessage({
                fromUserId: globals.userId,
                room,
                fromDeviceId: globals.deviceId,
            });

            const responseInvalidOne = await supertest(app)
                .delete(`/api/messenger/messages/${message.id}`)
                .set({ accesstoken: globals.userToken });

            const responseInvalidTwo = await supertest(app)
                .delete(`/api/messenger/messages/${message.id}?target=invalid`)
                .set({ accesstoken: globals.userToken });

            const responseValidOne = await supertest(app)
                .delete(`/api/messenger/messages/${message.id}?target=all`)
                .set({ accesstoken: globals.userToken });

            const responseValidTwo = await supertest(app)
                .delete(`/api/messenger/messages/${message.id}?target=all`)
                .set({ accesstoken: globals.userToken });

            expect(responseInvalidOne.status).to.eqls(400);
            expect(responseInvalidTwo.status).to.eqls(400);
            expect(responseValidOne.status).to.eqls(200);
            expect(responseValidTwo.status).to.eqls(200);
        });

        it("requires message to exist", async () => {
            const responseInvalid = await supertest(app)
                .delete("/api/messenger/messages/65415361531115131?target=all")
                .set({ accesstoken: globals.userToken });

            expect(responseInvalid.status).to.eqls(404);
        });

        it("requires user to be owner of message if target is all", async () => {
            const fakeUser = await createFakeUser();
            const message = await createFakeMessage({
                fromUserId: fakeUser.id,
                room,
                fromDeviceId: globals.deviceId,
            });

            const responseInvalid = await supertest(app)
                .delete(`/api/messenger/messages/${message.id}?target=all`)
                .set({ accesstoken: globals.userToken });

            expect(responseInvalid.status).to.eqls(403);
        });

        it("requires user to be in room if target is user", async () => {
            const room = await createFakeRoom([]);
            const message = await createFakeMessage({
                fromUserId: globals.userId,
                room,
                fromDeviceId: globals.deviceId,
            });

            const responseInvalid = await supertest(app)
                .delete(`/api/messenger/messages/${message.id}?target=all`)
                .set({ accesstoken: globals.userToken });

            expect(responseInvalid.status).to.eqls(403);
        });

        it("updates users messageDevices if target is user", async () => {
            const message = await createFakeMessage({
                fromUserId: globals.userId,
                room,
                fromDeviceId: globals.deviceId,
            });

            const responseValid = await supertest(app)
                .delete(`/api/messenger/messages/${message.id}?target=user`)
                .set({ accesstoken: globals.userToken });

            expect(responseValid.status).to.eqls(200);

            const deviceMessagesFromDb = await globals.prisma.deviceMessage.findMany({
                where: { messageId: message.id, userId: globals.userId },
            });
            expect(
                deviceMessagesFromDb.every(
                    (dm) => (dm.body as { text: string }).text === "Deleted message"
                )
            ).to.eqls(true);
        });

        it("updates all messageDevices if target is all", async () => {
            const message = await createFakeMessage({
                fromUserId: globals.userId,
                room,
                fromDeviceId: globals.deviceId,
            });

            const responseValid = await supertest(app)
                .delete(`/api/messenger/messages/${message.id}?target=user`)
                .set({ accesstoken: globals.userToken });

            expect(responseValid.status).to.eqls(200);

            const deviceMessagesFromDb = await globals.prisma.deviceMessage.findMany({
                where: { messageId: message.id },
            });
            expect(
                deviceMessagesFromDb.every(
                    (dm) => (dm.body as { text: string }).text === "Deleted message"
                )
            ).to.eqls(true);
        });

        it("updates message if target is all", async () => {
            const message = await createFakeMessage({
                fromUserId: globals.userId,
                room,
                fromDeviceId: globals.deviceId,
            });

            const responseValid = await supertest(app)
                .delete(`/api/messenger/messages/${message.id}?target=all`)
                .set({ accesstoken: globals.userToken });

            expect(responseValid.status).to.eqls(200);

            const messageFromDb = await globals.prisma.message.findUnique({
                where: { id: message.id },
            });
            expect(messageFromDb.deleted).to.eqls(true);
            expect(+messageFromDb.modifiedAt > +message.modifiedAt).to.eqls(true);
            expect(messageFromDb.type).to.eqls("text");
        });
    });

    describe("/api/messenger/messages/:id PUT", () => {
        let room: Room;

        before(async () => {
            room = await createFakeRoom([{ userId: globals.userId, isAdmin: true }]);
        });

        it("text is required", async () => {
            const message = await createFakeMessage({
                fromUserId: globals.userId,
                room,
                fromDeviceId: globals.deviceId,
            });

            const responseInvalid = await supertest(app)
                .put(`/api/messenger/messages/${message.id}`)
                .send({
                    text: "",
                })
                .set({ accesstoken: globals.userToken });

            const responseValid = await supertest(app)
                .put(`/api/messenger/messages/${message.id}`)
                .send({
                    text: "la la la",
                })
                .set({ accesstoken: globals.userToken });

            expect(responseInvalid.status).to.eqls(400);
            expect(responseValid.status).to.eqls(200);
        });

        it("requires message to exist", async () => {
            const responseInvalid = await supertest(app)
                .put("/api/messenger/messages/65415361531115131")
                .send({
                    text: "la la la",
                })
                .set({ accesstoken: globals.userToken });

            expect(responseInvalid.status).to.eqls(404);
        });

        it("can only update messages that have type text", async () => {
            const message = await createFakeMessage({
                fromUserId: globals.userId,
                room,
                type: "video",
                fromDeviceId: globals.deviceId,
            });

            const responseInvalid = await supertest(app)
                .put(`/api/messenger/messages/${message.id}`)
                .send({
                    text: "lal la",
                })
                .set({ accesstoken: globals.userToken });

            expect(responseInvalid.status).to.eqls(400);
        });

        it("requires user to be owner of message", async () => {
            const fakeUser = await createFakeUser();
            const message = await createFakeMessage({
                fromUserId: fakeUser.id,
                room,
                fromDeviceId: globals.deviceId,
            });

            const responseInvalid = await supertest(app)
                .put(`/api/messenger/messages/${message.id}`)
                .send({
                    text: "la la la",
                })
                .set({ accesstoken: globals.userToken });

            expect(responseInvalid.status).to.eqls(403);
        });

        it("updates all messageDevices", async () => {
            const message = await createFakeMessage({
                fromUserId: globals.userId,
                room,
                fromDeviceId: globals.deviceId,
            });

            const responseValid = await supertest(app)
                .put(`/api/messenger/messages/${message.id}`)
                .send({
                    text: "la la la",
                })
                .set({ accesstoken: globals.userToken });

            expect(responseValid.status).to.eqls(200);

            const deviceMessagesFromDb = await globals.prisma.deviceMessage.findMany({
                where: { messageId: message.id },
            });
            expect(
                deviceMessagesFromDb.every(
                    (dm) => (dm.body as { text: string }).text === "la la la"
                )
            ).to.eqls(true);
        });

        it("updates messages modifiedAt", async () => {
            const message = await createFakeMessage({
                fromUserId: globals.userId,
                room,
                fromDeviceId: globals.deviceId,
            });

            const responseValid = await supertest(app)
                .put(`/api/messenger/messages/${message.id}`)
                .send({
                    text: "la la la",
                })
                .set({ accesstoken: globals.userToken });

            expect(responseValid.status).to.eqls(200);

            const messageFromDb = await globals.prisma.message.findUnique({
                where: { id: message.id },
            });
            expect(+messageFromDb.modifiedAt > +message.modifiedAt).to.eqls(true);
        });
    });
});
