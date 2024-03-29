import { expect } from "chai";
import supertest from "supertest";
import app from "../server";
import globals from "./global";
import createFakeRoom from "./fixtures/room";
import { beforeEach, before } from "mocha";
import createFakeUser, { createManyFakeUsers } from "./fixtures/user";
import { RoomUser, Room, User } from ".prisma/client";
import sanitize from "../server/components/sanitize";
import utils from "../server/components/utils";

describe("API", () => {
    describe("/api/messenger/rooms POST", () => {
        let validParams: any = {};
        let users: User[];

        before(async () => {
            users = await createManyFakeUsers(4);
        });

        beforeEach(() => {
            validParams = {
                name: "string",
                type: "type",
                userIds: [users.map((u) => u.id)],
                adminUserIds: [users.map((u) => u.id)],
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
                .send({ ...validParams, userIds: [globals.userId] });
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
                .send({ ...validParams, userIds: [globals.userId] });

            expect(responseInvalid.status).to.eqls(400);
            expect(responseInvalidTwo.status).to.eqls(400);
            expect(responseValid.status).to.eqls(200);
        });

        it("Requires userIds array to contain valid user ids", async () => {
            const responseInvalid = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, userIds: [525651651515] });

            const responseInvalidTwo = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, userIds: [525651651515, globals.userId] });

            const responseValid = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, userIds: [globals.userId] });

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
                .send({ ...validParams, adminUserIds: [globals.userId] });

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
                .send({ ...validParams, adminUserIds: [globals.userId] });

            expect(responseInvalid.status).to.eqls(400);
            expect(responseInvalidTwo.status).to.eqls(400);
            expect(responseValid.status).to.eqls(200);
        });

        it("Requires adminUserIds array to contain valid user ids", async () => {
            const responseInvalid = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, adminUserIds: [525651651515] });

            const responseInvalidTwo = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, adminUserIds: [525651651515, globals.userId] });

            const responseValid = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, adminUserIds: [globals.userId] });

            expect(responseInvalid.status).to.eqls(400);
            expect(responseInvalidTwo.status).to.eqls(400);
            expect(responseValid.status).to.eqls(200);
        });

        it("avatarFileId param can be only number", async () => {
            const responseUndefined = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, avatarFileId: undefined });

            const responseInvalidNotNumber = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, avatarFileId: "[42]" });

            const responseValid = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, avatarFileId: 42 });

            expect(responseUndefined.status).to.eqls(200);
            expect(responseInvalidNotNumber.status).to.eqls(400);
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

        it("sets name to 'Untitled room' when more than two users", async () => {
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
            expect(roomFromRes.name).to.eqls("Untitled room");
        });

        it("adds user as admin", async () => {
            const responseWithFakeUsers = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, userIds: [users[1].id], adminUserIds: [] });

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
            const user = await createFakeUser();
            const responseOne = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ ...validParams, type: undefined, userIds: [user.id], adminUserIds: [] });

            expect(responseOne.status).to.eqls(200);
            expect(responseOne.body).to.has.property("data");
            expect(responseOne.body.data).to.has.property("room");
            expect(responseOne.body.data.room.type).to.eqls("private");

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
                include: {
                    users: {
                        include: {
                            user: true,
                        },
                    },
                },
            });

            globals.roomId = response.body.data.room.id;

            expect(JSON.stringify(response.body.data.room)).to.eqls(
                JSON.stringify(sanitize({ ...room, muted: false }).room())
            );
        });

        it("Two users can't have more than one private room", async () => {
            const user = await createFakeUser();

            await createFakeRoom(
                [
                    { userId: globals.userId, isAdmin: true },
                    { userId: user.id, isAdmin: false },
                ],
                { type: "private" }
            );

            const response = await supertest(app)
                .post("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken })
                .send({ userIds: [user.id] });

            expect(response.status).to.eqls(409);
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
            const room = await createFakeRoom([
                { userId: globals.userId, isAdmin: true },
                ...adminUserIds.map((userId) => ({ userId, isAdmin: false })),
            ]);

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

        it("updates avatarFileId if defined", async () => {
            const room = await createFakeRoom([{ userId: globals.userId, isAdmin: true }]);
            const avatarFileId = 55;

            const response = await supertest(app)
                .put("/api/messenger/rooms/" + room.id)
                .set({ accesstoken: globals.userToken })
                .send({ avatarFileId });

            expect(response.status).to.eqls(200);
            expect(response.body).to.has.property("data");
            expect(response.body.data).to.has.property("room");

            const roomFromRes = response.body.data.room;
            expect(roomFromRes.avatarFileId).to.eqls(avatarFileId);
        });

        it("updates are saved in db", async () => {
            const admins = await createManyFakeUsers(2);
            const adminUserIds = admins.map((u) => u.id);
            const users = await createManyFakeUsers(2);
            const userIds = users.map((u) => u.id).concat(...adminUserIds, globals.userId);
            const room = await createFakeRoom([
                { userId: globals.userId, isAdmin: true },
                ...adminUserIds.map((userId) => ({ userId, isAdmin: false })),
            ]);
            const avatarFileId = 88;
            const name = "Cool kids room";

            const response = await supertest(app)
                .put("/api/messenger/rooms/" + room.id)
                .set({ accesstoken: globals.userToken })
                .send({ avatarFileId, name, userIds, adminUserIds });

            expect(response.status).to.eqls(200);

            const roomFromDb = await globals.prisma.room.findUnique({
                where: { id: room.id },
                include: { users: true },
            });

            expect(roomFromDb).to.has.property("avatarFileId");
            expect(roomFromDb.avatarFileId).to.eqls(avatarFileId);
            expect(roomFromDb).to.has.property("name");
            expect(roomFromDb.name).to.eqls(name);
            expect(roomFromDb).to.has.property("users");
            expect(roomFromDb.users).to.be.an("array");
            expect(
                roomFromDb.users.filter((u: RoomUser) => !u.isAdmin).map((u: RoomUser) => u.userId)
            ).to.include.members(users.map((u) => u.id));
            expect(
                roomFromDb.users.filter((u: RoomUser) => u.isAdmin).map((u: RoomUser) => u.userId)
            ).to.include.members([globals.userId, ...adminUserIds]);
        });
    });

    describe("/api/messenger/rooms GET", () => {
        it("Gets list of users rooms", async () => {
            const response = await supertest(app)
                .get("/api/messenger/rooms")
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(200);
            expect(response.body).to.has.property("data");
            expect(response.body.data).to.has.property("list");

            const roomsFromRes = response.body.data.list as (Room & { users: RoomUser[] })[];
            expect(roomsFromRes).to.be.an("array");
            expect(
                roomsFromRes.every((r) => r.users.map((u) => u.userId).includes(globals.userId))
            ).to.eqls(true);
        });

        it("Return 0 when keyword is ramdom", async () => {
            const response = await supertest(app)
                .get("/api/messenger/rooms?keyword=sssssss")
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(200);
            expect(response.body).to.has.property("data");
            expect(response.body.data).to.has.property("list");
            expect(response.body.data.list.length).to.eqls(0);
        });
    });

    describe("/api/messenger/rooms/:id GET", () => {
        it("Gets room details", async () => {
            const room = await createFakeRoom([{ userId: globals.userId, isAdmin: true }]);

            const response = await supertest(app)
                .get(`/api/messenger/rooms/${room.id}`)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(200);
            expect(response.body).to.has.property("data");
            expect(response.body.data).to.has.property("room");
            expect(response.body.data.room.id).to.eqls(room.id);
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

            const roomFromDb = await globals.prisma.room.findUnique({ where: { id: room.id } });

            expect(roomFromDb).to.has.property("deleted");
            expect(roomFromDb.deleted).to.eqls(true);
        });
    });

    describe("/api/messenger/rooms/:id/mute PUT", () => {
        it("returns 404 if there is no room with that id", async () => {
            const id = 865454588;

            const response = await supertest(app)
                .post(`/api/messenger/rooms/${id}/mute`)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(404);
        });

        it("user can leave mute room", async () => {
            const user = await createFakeUser();
            const room = await createFakeRoom([
                { userId: user.id, isAdmin: true },
                { userId: globals.userId },
            ]);

            const response = await supertest(app)
                .post(`/api/messenger/rooms/${room.id}/mute`)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(200);
        });
    });

    describe("/api/messenger/rooms/:id/unmute PUT", () => {
        it("returns 404 if there is no room with that id", async () => {
            const id = 865454588;

            const response = await supertest(app)
                .post(`/api/messenger/rooms/${id}/unmute`)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(404);
        });

        it("user can leave unmute room", async () => {
            const user = await createFakeUser();
            const room = await createFakeRoom([
                { userId: user.id, isAdmin: true },
                { userId: globals.userId },
            ]);

            const response = await supertest(app)
                .post(`/api/messenger/rooms/${room.id}/unmute`)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(200);
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

    describe("/api/messenger/rooms/sync GET", () => {
        it("Requires lastUpdate to be number", async () => {
            const response = await supertest(app)
                .get("/api/messenger/rooms/sync/abc58")
                .set({ accesstoken: globals.userToken });
            expect(response.status).to.eqls(400);
        });

        it("Returns new rooms from lastUpdate", async () => {
            const lastUpdate = +new Date() - 100;
            const room = await createFakeRoom([{ userId: globals.userId, isAdmin: true }]);

            const response = await supertest(app)
                .get("/api/messenger/rooms/sync/" + lastUpdate)
                .set({ accesstoken: globals.userToken });

            console.log({ d: response.body.data });

            expect(response.status).to.eqls(200);
            expect(response.body.data).to.has.property("rooms");
            expect(response.body.data.rooms.some((m: any) => m.id === room.id)).to.be.true;
        });

        it("Returns updated rooms from lastUpdate", async () => {
            const room = await createFakeRoom([{ userId: globals.userId, isAdmin: true }]);
            const lastUpdate = +new Date();

            const updatedRoom = await globals.prisma.room.update({
                where: { id: room.id },
                data: { name: "changed", modifiedAt: new Date(lastUpdate + 1000) },
            });

            const response = await supertest(app)
                .get("/api/messenger/rooms/sync/" + lastUpdate)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(200);
            expect(response.body.data).to.has.property("rooms");
            expect(response.body.data.rooms.some((m: any) => m.name === updatedRoom.name)).to.be
                .true;
        });
    });
});
