import { expect } from "chai";
import supertest from "supertest";
import app from "../server";
import globals from "./global";
import createFakeDevice from "./fixtures/device";
import createFakeRoom from "./fixtures/room";
import createFakeUser from "./fixtures/user";
import createFakeMessage from "./fixtures/message";

describe("API", () => {
    describe("/api/messenger/history GET", () => {
        it("returns room list", async () => {
            const newDevice = await createFakeDevice(globals.userId);

            const response = await supertest(app)
                .get("/api/messenger/history")
                .set({ accessToken: newDevice.token });

            expect(response.status).to.eqls(200);
            expect(response.body).to.has.property("data");
            expect(response.body.data).to.has.property("list");
            expect(response.body.data.list).to.be.an("array");
        });

        it("Filter by keyword returns private room that starts with given keyword", async () => {
            const user = await createFakeUser({ displayName: "Johnny" });
            const room = await createFakeRoom(
                [{ userId: globals.userId, isAdmin: true }, { userId: user.id }],
                { type: "private" }
            );

            await createFakeMessage({
                room,
                fromUserId: globals.userId,
                fromDeviceId: globals.deviceId,
            });

            const response = await supertest(app)
                .get("/api/messenger/history?keyword=John")
                .set({ accessToken: globals.userToken });

            expect(response.status).to.eqls(200);
            expect(response.body).to.has.property("data");
            expect(response.body.data).to.has.property("list");
            expect(response.body.data.list.length).to.eqls(1);
        });

        it("Filter by keyword returns private room that contains given keyword", async () => {
            const user = await createFakeUser({ displayName: "MarrkyMark" });
            const room = await createFakeRoom(
                [{ userId: globals.userId, isAdmin: true }, { userId: user.id }],
                { type: "private" }
            );

            await createFakeMessage({
                room,
                fromUserId: globals.userId,
                fromDeviceId: globals.deviceId,
            });

            const response = await supertest(app)
                .get("/api/messenger/history?keyword=arrkyMar")
                .set({ accessToken: globals.userToken });

            expect(response.status).to.eqls(200);
            expect(response.body).to.has.property("data");
            expect(response.body.data).to.has.property("list");
            expect(response.body.data.list.length).to.eqls(1);
        });

        it("Filter by keyword returns group room that starts with given keyword", async () => {
            const room = await createFakeRoom([{ userId: globals.userId, isAdmin: true }], {
                type: "group",
                name: "Johnathan",
            });

            await createFakeMessage({
                room,
                fromUserId: globals.userId,
                fromDeviceId: globals.deviceId,
            });

            const response = await supertest(app)
                .get("/api/messenger/history?keyword=Johnath")
                .set({ accessToken: globals.userToken });

            expect(response.status).to.eqls(200);
            expect(response.body).to.has.property("data");
            expect(response.body.data).to.has.property("list");
            expect(response.body.data.list.length).to.eqls(1);
        });

        it("Filter by keyword returns group room that contains given keyword", async () => {
            const room = await createFakeRoom([{ userId: globals.userId, isAdmin: true }], {
                type: "group",
                name: "Robocall",
            });

            await createFakeMessage({
                room,
                fromUserId: globals.userId,
                fromDeviceId: globals.deviceId,
            });

            const response = await supertest(app)
                .get("/api/messenger/history?keyword=obocal")
                .set({ accessToken: globals.userToken });

            expect(response.status).to.eqls(200);
            expect(response.body).to.has.property("data");
            expect(response.body.data).to.has.property("list");
            expect(response.body.data.list.length).to.eqls(1);
        });
    });
});
