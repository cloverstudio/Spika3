import { expect } from "chai";
import supertest from "supertest";
import app from "../server";
import globals from "./global";
import * as Constants from "../server/components/consts";
import path from "path";
import utils from "../server/components/utils";
import createFakeRoom from "./fixtures/room";
import faker from "faker";
import { after, beforeEach } from "mocha";
import createFakeUser, { createManyFakeUsers } from "./fixtures/user";
import { RoomUser } from ".prisma/client";

describe("API", () => {
    describe("/api/messenger/rooms POST", () => {
        let validParams: any = {};

        beforeEach(() => {
            validParams = {
                name: "string",
                type: "type",
                userIds: [1, 2, 3],
                adminUserIds: [1, 2, 3],
                avatarUrl: "/url/avatar",
            };
        });

        it("name param can be only string", async () => {
            const response = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, name: undefined });

            const responseInvalidNotString = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, name: [42] });

            const responseValid = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, name: "string" });

            expect(response.status).to.eqls(200);
            expect(responseInvalidNotString.status).to.eqls(400);
            expect(responseValid.status).to.eqls(200);
        });

        it("userIds param can only be array", async () => {
            const response = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, userIds: undefined });

            const responseInvalidNotArray = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, userIds: 42 });

            const responseValid = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, userIds: [1] });
            expect(response.status).to.eqls(200);
            expect(responseInvalidNotArray.status).to.eqls(400);
            expect(responseValid.status).to.eqls(200);
        });

        it("Requires userIds array to contain numbers", async () => {
            const responseInvalid = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, userIds: ["string"] });

            const responseInvalidTwo = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, userIds: [true] });

            const responseValid = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, userIds: [1] });

            expect(responseInvalid.status).to.eqls(400);
            expect(responseInvalidTwo.status).to.eqls(400);
            expect(responseValid.status).to.eqls(200);
        });

        it("adminUserIds param can only be array", async () => {
            const response = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, adminUserIds: undefined });

            const responseInvalidNotArray = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, adminUserIds: 42 });

            const responseValid = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, adminUserIds: [1] });

            expect(response.status).to.eqls(200);
            expect(responseInvalidNotArray.status).to.eqls(400);
            expect(responseValid.status).to.eqls(200);
        });

        it("Requires adminUserIds array to contain numbers", async () => {
            const responseInvalid = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, adminUserIds: ["string"] });

            const responseInvalidTwo = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, adminUserIds: [true] });

            const responseValid = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, adminUserIds: [1] });

            expect(responseInvalid.status).to.eqls(400);
            expect(responseInvalidTwo.status).to.eqls(400);
            expect(responseValid.status).to.eqls(200);
        });

        it("avatarUrl param can be only string", async () => {
            const responseUndefined = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, avatarUrl: undefined });

            const responseInvalidNotString = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, avatarUrl: [42] });

            const responseValid = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, avatarUrl: "string" });

            expect(responseUndefined.status).to.eqls(200);
            expect(responseInvalidNotString.status).to.eqls(400);
            expect(responseValid.status).to.eqls(200);
        });

        it("type param can be only string", async () => {
            const responseUndefined = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, type: undefined });

            const responseInvalidNotString = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, type: 42 });

            const responseValid = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, type: "string" });

            expect(responseUndefined.status).to.eqls(200);
            expect(responseInvalidNotString.status).to.eqls(400);
            expect(responseValid.status).to.eqls(200);
        });

        it("sets defined name", async () => {
            const name = "Crazy room";
            const responseWithName = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, name });

            expect(responseWithName.status).to.eqls(200);
            expect(responseWithName.body).to.has.property("data");
            expect(responseWithName.body.data).to.has.property("room");

            const roomFromRes = responseWithName.body.data.room;
            expect(roomFromRes.name).to.eqls(name);
        });

        it("sets name to 'Private room' when only one user", async () => {
            const response = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, name: undefined, userIds: [], adminUserIds: [] });

            expect(response.status).to.eqls(200);
            expect(response.body).to.has.property("data");
            expect(response.body.data).to.has.property("room");

            const roomFromRes = response.body.data.room;
            expect(roomFromRes.name).to.eqls("Private room");
        });

        it("sets name to empty string when only two users", async () => {
            const user = await createFakeUser();

            const response = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, name: undefined, userIds: [user.id], adminUserIds: [] });

            expect(response.status).to.eqls(200);
            expect(response.body).to.has.property("data");
            expect(response.body.data).to.has.property("room");

            const roomFromRes = response.body.data.room;
            expect(roomFromRes.name).to.eqls("");
        });

        it("sets name to 'United room' when more than two users", async () => {
            const users = await createManyFakeUsers(2);

            const response = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({
                    ...validParams,
                    name: undefined,
                    userIds: users.map((u) => u.id),
                    adminUserIds: [],
                });

            expect(response.status).to.eqls(200);
            expect(response.body).to.has.property("data");
            expect(response.body.data).to.has.property("room");

            const roomFromRes = response.body.data.room;
            expect(roomFromRes.name).to.eqls("United room");
        });

        it("ignores users that doesn't exist", async () => {
            const userIds = [99999, 8585588];
            const adminUserIds = [991999, 85785588];

            const responseWithFakeUsers = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, userIds, adminUserIds });

            expect(responseWithFakeUsers.status).to.eqls(200);
            expect(responseWithFakeUsers.body).to.has.property("data");
            expect(responseWithFakeUsers.body.data).to.has.property("room");

            const roomFromRes = responseWithFakeUsers.body.data.room;
            expect(roomFromRes.users).to.be.an("array");
            expect(
                roomFromRes.users.some((u: { id: number }) =>
                    [...userIds, ...adminUserIds].includes(u.id)
                )
            ).to.eqls(false);
        });

        it("adds user as admin", async () => {
            const responseWithFakeUsers = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, userIds: [], adminUserIds: [] });

            expect(responseWithFakeUsers.status).to.eqls(200);
            expect(responseWithFakeUsers.body).to.has.property("data");
            expect(responseWithFakeUsers.body.data).to.has.property("room");

            const roomFromRes = responseWithFakeUsers.body.data.room;
            expect(roomFromRes).to.has.property("users");
            expect(roomFromRes.users).to.be.an("array");
            expect(
                roomFromRes.users.filter((u: RoomUser) => u.isAdmin).map((u: RoomUser) => u.userId)
            )
                .to.be.an("array")
                .that.does.include(globals.userId);
        });

        it("sets defined type", async () => {
            const type = "custom";
            const response = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, type });

            expect(response.status).to.eqls(200);
            expect(response.body).to.has.property("data");
            expect(response.body.data).to.has.property("room");

            const roomFromRes = response.body.data.room;
            expect(roomFromRes.type).to.eqls(type);
        });

        it("sets type as private when appropriate", async () => {
            const responseOne = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, type: undefined, userIds: [] });

            expect(responseOne.status).to.eqls(200);
            expect(responseOne.body).to.has.property("data");
            expect(responseOne.body.data).to.has.property("room");
            expect(responseOne.body.data.room.type).to.eqls("private");

            const user = await createFakeUser();
            const responseTwo = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, type: undefined, userIds: [user.id] });

            expect(responseTwo.status).to.eqls(200);
            expect(responseTwo.body).to.has.property("data");
            expect(responseTwo.body.data).to.has.property("room");
            expect(responseTwo.body.data.room.type).to.eqls("private");

            const type = "defined";
            const responseThree = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, type, userIds: [user.id] });

            expect(responseThree.status).to.eqls(200);
            expect(responseThree.body).to.has.property("data");
            expect(responseThree.body.data).to.has.property("room");
            expect(responseThree.body.data.room.type).to.eqls(type);
        });

        it("saves room to db", async () => {
            const response = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send(validParams);

            expect(response.status).to.eqls(200);
            expect(response.body).to.has.property("data");
            expect(response.body.data).to.has.property("room");

            const room = await globals.prisma.room.findFirst({
                where: { id: response.body.data.room.id },
                include: { users: true },
            });

            expect(JSON.stringify(response.body.data.room)).to.eqls(JSON.stringify(room));
        });
    });

    describe("/api/messenger/rooms/:id PUT", () => {
        it("returns 404 if there is no record with that id", async () => {
            const id = 8851534158;

            const response = await supertest(app)
                .put("/api/messenger/rooms/" + id)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(404);
        });

        it("returns 403 if user is not an admin", async () => {
            const user = await createFakeUser();
            const room = await createFakeRoom([{ userId: user.id, isAdmin: true }]);

            const response = await supertest(app)
                .put("/api/messenger/rooms/" + room.id)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(403);
        });

        it("adds users to user list", async () => {
            const users = await createManyFakeUsers(3);
            const userIds = users.map((u) => u.id);
            const room = await createFakeRoom([{ userId: globals.userId, isAdmin: true }]);

            const response = await supertest(app)
                .put("/api/messenger/rooms/" + room.id)
                .set({ accesstoken: globals.userToken })
                .send({ userIds });

            expect(response.status).to.eqls(200);
            expect(response.body).to.has.property("data");
            expect(response.body.data).to.has.property("room");

            const roomFromRes = response.body.data.room;
            expect(roomFromRes.users).to.be.an("array");
            expect(
                roomFromRes.users.filter((u: RoomUser) => !u.isAdmin).map((u: RoomUser) => u.userId)
            ).to.include.members(userIds);
        });

        it("removes users from user list", async () => {
            const users = await createManyFakeUsers(3);
            const userIds = users.map((u) => u.id);
            const room = await createFakeRoom([
                { userId: globals.userId, isAdmin: true },
                ...userIds.map((userId) => ({ userId, isAdmin: false })),
            ]);

            const response = await supertest(app)
                .put("/api/messenger/rooms/" + room.id)
                .set({ accesstoken: globals.userToken })
                .send({ userIds: [] });

            expect(response.status).to.eqls(200);
            expect(response.body).to.has.property("data");
            expect(response.body.data).to.has.property("room");

            const roomFromRes = response.body.data.room;
            expect(roomFromRes.users).to.be.an("array");
            expect(
                roomFromRes.users.filter((u: RoomUser) => !u.isAdmin).map((u: RoomUser) => u.userId)
            ).to.have.length(0);
        });

        it("adds users to admin list", async () => {
            const users = await createManyFakeUsers(3);
            const adminUserIds = users.map((u) => u.id);
            const room = await createFakeRoom([{ userId: globals.userId, isAdmin: true }]);

            const response = await supertest(app)
                .put("/api/messenger/rooms/" + room.id)
                .set({ accesstoken: globals.userToken })
                .send({ adminUserIds });

            expect(response.status).to.eqls(200);
            expect(response.body).to.has.property("data");
            expect(response.body.data).to.has.property("room");

            const roomFromRes = response.body.data.room;
            expect(roomFromRes.users).to.be.an("array");
            expect(
                roomFromRes.users.filter((u: RoomUser) => u.isAdmin).map((u: RoomUser) => u.userId)
            ).to.include.members([globals.userId, ...adminUserIds]);
        });

        it("change type to 'group' if the number of users of the room changes from 2 to 3", async () => {
            const users = await createManyFakeUsers(2);
            const userIds = users.map((u) => u.id);
            const room = await createFakeRoom([
                { userId: globals.userId, isAdmin: true },
                { userId: users[0].id },
            ]);

            expect(room.type).not.to.eqls("group");

            const response = await supertest(app)
                .put("/api/messenger/rooms/" + room.id)
                .set({ accesstoken: globals.userToken })
                .send({ userIds });

            expect(response.status).to.eqls(200);
            expect(response.body).to.has.property("data");
            expect(response.body.data).to.has.property("room");

            const roomFromRes = response.body.data.room;
            expect(roomFromRes.users).to.be.an("array");
            expect(roomFromRes.users).to.have.length(3);
            expect(roomFromRes).to.has.property("type");

            expect(roomFromRes.type).to.eqls("group");
        });

        it("updates name if defined", async () => {
            const room = await createFakeRoom([{ userId: globals.userId, isAdmin: true }]);
            const name = "Kool kids room";

            const response = await supertest(app)
                .put("/api/messenger/rooms/" + room.id)
                .set({ accesstoken: globals.userToken })
                .send({ name });

            expect(response.status).to.eqls(200);
            expect(response.body).to.has.property("data");
            expect(response.body.data).to.has.property("room");

            const roomFromRes = response.body.data.room;
            expect(roomFromRes.name).to.eqls(name);
        });

        it("updates avatarUrl if defined", async () => {
            const room = await createFakeRoom([{ userId: globals.userId, isAdmin: true }]);
            const avatarUrl = "/some/new/path";

            const response = await supertest(app)
                .put("/api/messenger/rooms/" + room.id)
                .set({ accesstoken: globals.userToken })
                .send({ avatarUrl });

            expect(response.status).to.eqls(200);
            expect(response.body).to.has.property("data");
            expect(response.body.data).to.has.property("room");

            const roomFromRes = response.body.data.room;
            expect(roomFromRes.avatarUrl).to.eqls(avatarUrl);
        });

        it("updates are saved in db", async () => {
            const room = await createFakeRoom([{ userId: globals.userId, isAdmin: true }]);
            const avatarUrl = "/some/new/path";
            const name = "Kool kids room";
            const users = await createManyFakeUsers(2);
            const userIds = users.map((u) => u.id);
            const admins = await createManyFakeUsers(2);
            const adminUserIds = admins.map((u) => u.id);

            const response = await supertest(app)
                .put("/api/messenger/rooms/" + room.id)
                .set({ accesstoken: globals.userToken })
                .send({ avatarUrl, name, userIds, adminUserIds });

            expect(response.status).to.eqls(200);

            const roomFromDb = await globals.prisma.room.findUnique({
                where: { id: room.id },
                include: { users: true },
            });

            expect(roomFromDb).to.has.property("avatarUrl");
            expect(roomFromDb.avatarUrl).to.eqls(avatarUrl);
            expect(roomFromDb).to.has.property("name");
            expect(roomFromDb.name).to.eqls(name);
            expect(roomFromDb).to.has.property("users");
            expect(roomFromDb.users).to.be.an("array");
            expect(
                roomFromDb.users.filter((u: RoomUser) => u.isAdmin).map((u: RoomUser) => u.userId)
            ).to.include.members([globals.userId, ...adminUserIds]);
            expect(
                roomFromDb.users.filter((u: RoomUser) => !u.isAdmin).map((u: RoomUser) => u.userId)
            ).to.include.members(userIds);
        });
    });

    describe("/api/messenger/rooms/:id DELETE", () => {
        it("returns 404 if there is no record with that id", async () => {
            const id = 865454588;

            const response = await supertest(app)
                .delete("/api/messenger/rooms/" + id)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(404);
        });

        it("returns 403 if user is not an admin", async () => {
            const user = await createFakeUser();
            const room = await createFakeRoom([{ userId: user.id, isAdmin: true }]);

            const response = await supertest(app)
                .delete("/api/messenger/rooms/" + room.id)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(403);
        });

        it("flags room as deleted", async () => {
            const room = await createFakeRoom([{ userId: globals.userId, isAdmin: true }]);

            const response = await supertest(app)
                .delete("/api/messenger/rooms/" + room.id)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(200);
            expect(response.body).to.has.property("data");
            expect(response.body.data).to.has.property("room");

            const roomFromRes = response.body.data.room;
            expect(roomFromRes.deleted).to.eqls(true);
        });

        it("deletion is saved in db", async () => {
            const room = await createFakeRoom([{ userId: globals.userId, isAdmin: true }]);

            const response = await supertest(app)
                .delete("/api/messenger/rooms/" + room.id)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(200);

            const roomFromDb = await globals.prisma.room.findUnique({ where: { id: room.id } });

            expect(roomFromDb).to.has.property("deleted");
            expect(roomFromDb.deleted).to.eqls(true);
        });
    });

    describe("/api/messenger/rooms/:id/leave POST", () => {
        it("returns 404 if there is no record with that id", async () => {
            const id = 865454588;

            const response = await supertest(app)
                .post(`/api/messenger/rooms/${id}/leave`)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(404);
        });

        it("returns 404 if user is not in that room", async () => {
            const user = await createFakeUser();
            const room = await createFakeRoom([{ userId: user.id, isAdmin: true }]);

            const response = await supertest(app)
                .post(`/api/messenger/rooms/${room.id}/leave`)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(404);
        });

        it("user can leave room", async () => {
            const user = await createFakeUser();
            const room = await createFakeRoom([
                { userId: user.id, isAdmin: true },
                { userId: globals.userId },
            ]);

            const response = await supertest(app)
                .post(`/api/messenger/rooms/${room.id}/leave`)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(200);
            expect(response.body).to.has.property("data");
            expect(response.body.data).to.has.property("room");

            const roomFromRes = response.body.data.room;
            expect(roomFromRes.users).to.be.an("array");
            expect(roomFromRes.users.map((u: RoomUser) => u.userId)).to.not.include(globals.userId);
        });

        it("not last admin can leave room", async () => {
            const user = await createFakeUser();
            const room = await createFakeRoom([
                { userId: user.id, isAdmin: true },
                { userId: globals.userId, isAdmin: true },
            ]);

            const response = await supertest(app)
                .post(`/api/messenger/rooms/${room.id}/leave`)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(200);
            expect(response.body).to.has.property("data");
            expect(response.body.data).to.has.property("room");

            const roomFromRes = response.body.data.room;
            expect(roomFromRes.users).to.be.an("array");
            expect(roomFromRes.users.map((u: RoomUser) => u.userId)).to.not.include(globals.userId);
        });

        it("Last admin can leave room", async () => {
            const user = await createFakeUser();
            const room = await createFakeRoom([{ userId: globals.userId, isAdmin: true }]);

            const response = await supertest(app)
                .post(`/api/messenger/rooms/${room.id}/leave`)
                .set({ accesstoken: globals.userToken })
                .send({ adminUserIds: [user.id] });

            expect(response.status).to.eqls(200);
            expect(response.body).to.has.property("data");
            expect(response.body.data).to.has.property("room");

            const roomFromRes = response.body.data.room;
            expect(roomFromRes.users).to.be.an("array");
            expect(roomFromRes.users.map((u: RoomUser) => u.userId)).to.not.include(globals.userId);
            expect(roomFromRes.users.map((u: RoomUser) => u.userId)).to.include(user.id);
        });

        it("Last admin have to send adminUserIds so he can leave room", async () => {
            const room = await createFakeRoom([{ userId: globals.userId, isAdmin: true }]);

            const response = await supertest(app)
                .post(`/api/messenger/rooms/${room.id}/leave`)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(400);
        });
    });
});
