import chai, { expect } from "chai";

import supertest from "supertest";
import app from "../server";
import globals from "./global";
import * as Constants from "../server/components/consts";
import createFakeRoom from "./fixtures/room";
import { before, beforeEach, afterEach } from "mocha";
import { Room } from ".prisma/client";
import { createFakeDevices } from "./fixtures/device";
import { createManyFakeUsers } from "./fixtures/user";
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

            const { messageBody: _, ...messageFromResponse } = response.body.data.message;
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

        it("every deviceMessage contains messageBody", async () => {
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
            const messageBodies = deviceMessages.map((dm) => dm.messageBody);

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
});
