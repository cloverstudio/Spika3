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
            const avatarUrl = "/new/avatar/url";
            const response = await supertest(app)
                .put("/api/messenger/me/")
                .send({
                    displayName,
                    avatarUrl,
                })
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(200);
            expect(response.body).to.has.property("data");
            expect(response.body.data).to.has.property("user");
            expect(response.body.data.user.displayName).to.eqls(displayName);
            expect(response.body.data.user.avatarUrl).to.eqls(avatarUrl);

            const userFromDb = await globals.prisma.user.findUnique({
                where: { id: globals.userId },
            });

            expect(userFromDb.displayName).to.eqls(displayName);
            expect(userFromDb.avatarUrl).to.eqls(avatarUrl);
        });
    });
});
