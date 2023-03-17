import { User } from "@prisma/client";
import { expect } from "chai";
import supertest from "supertest";
import app from "../server";
import createFakeUser from "./fixtures/user";
import globals from "./global";

describe("User API", () => {
    describe("/api/messenger/me GET", () => {
        it("Should return my user", async () => {
            const response = await supertest(app)
                .get("/api/messenger/me")
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(200);
            expect(response.body).to.has.property("data");
            expect(response.body.data).to.has.property("user");
        });
    });

    describe("/api/messenger/me PUT", () => {
        it("Requires email to be unique", async () => {
            const fakeUser = await createFakeUser();
            const response = await supertest(app)
                .put("/api/messenger/me/")
                .send({
                    emailAddress: fakeUser.emailAddress,
                })
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(400);
        });

        it("Requires telephoneNumber to be unique", async () => {
            const fakeUser = await createFakeUser();
            const response = await supertest(app)
                .put("/api/messenger/me/")
                .send({
                    telephoneNumber: fakeUser.telephoneNumber,
                })
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(400);
        });

        it("Updates user", async () => {
            const displayName = "John";
            const avatarFileId = 44;
            const response = await supertest(app)
                .put("/api/messenger/me/")
                .send({
                    displayName,
                    avatarFileId,
                })
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(200);
            expect(response.body).to.has.property("data");
            expect(response.body.data).to.has.property("user");
            expect(response.body.data.user.displayName).to.eqls(displayName);
            expect(response.body.data.user.avatarFileId).to.eqls(avatarFileId);

            const userFromDb = await globals.prisma.user.findUnique({
                where: { id: globals.userId },
            });

            expect(userFromDb.displayName).to.eqls(displayName);
            expect(userFromDb.avatarFileId).to.eqls(avatarFileId);
        });

        it("Gets user details", async () => {
            const response = await supertest(app)
                .get("/api/messenger/users/" + globals.userId)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(200);
            expect(response.body).to.has.property("data");
            expect(response.body.data).to.has.property("user");

            const userFromRes = response.body.data.user;

            const userFromDb = await globals.prisma.user.findUnique({
                where: { id: globals.userId },
            });

            expect(userFromDb.displayName).to.eqls(userFromRes.displayName);
            expect(userFromDb.avatarFileId).to.eqls(userFromRes.avatarFileId);
        });
    });

    describe("/api/messenger/users/sync/:timestamp GET", () => {
        it("Timestamp must be number", async () => {
            const response = await supertest(app)
                .get("/api/messenger/users/sync/a54dsa5d4sa5d4as5")
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(400);
        });

        it("Gets users that are modified after timestamp", async () => {
            const user = await createFakeUser();

            const timestamp = +new Date() - 100;

            await globals.prisma.user.update({
                where: { id: user.id },
                data: { modifiedAt: new Date() },
            });

            const response = await supertest(app)
                .get("/api/messenger/users/sync/" + timestamp)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(200);
            expect(response.body).to.has.property("data");
            expect(response.body.data).to.has.property("users");

            const users = response.body.data.users as User[];

            expect(users.some((u) => u.id === user.id)).to.eqls(true);
        });
    });

    describe("/api/messenger/me/settings GET", () => {
        it("Get user settings works", async () => {
            const response = await supertest(app)
                .get("/api/messenger/me/settings")
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(200);
        });
    });
});
