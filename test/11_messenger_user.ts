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
            const updateObj = {
                telephoneNumber: "+3859777789",
                firstName: "žan",
                lastName: "wan",
                country: "HR",
                city: "Zagreb",
                gender: "male",
                email: "email@email.com",
                dob: +new Date(),
            };
            const response = await supertest(app)
                .put("/api/messenger/me/")
                .send(updateObj)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(200);
            expect(response.body).to.has.property("data");
            expect(response.body.data).to.has.property("user");
            expect(response.body.data.user.telephoneNumber).to.eqls(updateObj.telephoneNumber);
            expect(response.body.data.user.firstName).to.eqls(updateObj.firstName);
            expect(response.body.data.user.lastName).to.eqls(updateObj.lastName);
            expect(response.body.data.user.country).to.eqls(updateObj.country);
            expect(response.body.data.user.gender).to.eqls(updateObj.gender);
            expect(response.body.data.user.emailAddress).to.eqls(updateObj.email);

            const userFromDb = await globals.prisma.user.findUnique({
                where: { id: globals.userId },
            });

            expect(userFromDb.telephoneNumber).to.eqls(updateObj.telephoneNumber);
            expect(userFromDb.firstName).to.eqls(updateObj.firstName);
            expect(userFromDb.lastName).to.eqls(updateObj.lastName);
            expect(userFromDb.country).to.eqls(updateObj.country);
            expect(userFromDb.gender).to.eqls(updateObj.gender);
            expect(userFromDb.emailAddress).to.eqls(updateObj.email);
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
            expect(userFromDb.avatarUrl).to.eqls(userFromRes.avatarUrl);
        });
    });

    describe("/api/messenger/users/sync/:timestamp PUT", () => {
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
});
