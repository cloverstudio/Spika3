import { Room, User, UserBlock } from "@prisma/client";
import { expect } from "chai";
import supertest from "supertest";
import app from "../server";
import createFakeRoom from "./fixtures/room";
import createFakeUser from "./fixtures/user";
import globals from "./global";

describe("API", () => {
    let user: User;

    before(async () => {
        user = await createFakeUser();
    });

    describe("/api/messenger/blocks POST", () => {
        it("blockedId is required", async () => {
            const invalidResponse = await supertest(app)
                .post(`/api/messenger/blocks`)
                .set({ accesstoken: globals.userToken })
                .send({ blockedId: undefined });

            const validResponse = await supertest(app)
                .post(`/api/messenger/blocks`)
                .set({ accesstoken: globals.userToken })
                .send({ blockedId: user.id });

            expect(invalidResponse.status).to.eqls(400);
            expect(validResponse.status).to.eqls(200);
        });

        it("blockedId must be valid", async () => {
            const invalidResponse = await supertest(app)
                .post(`/api/messenger/blocks`)
                .set({ accesstoken: globals.userToken })
                .send({ blockedId: "not valid" });

            const validResponse = await supertest(app)
                .post(`/api/messenger/blocks`)
                .set({ accesstoken: globals.userToken })
                .send({ blockedId: user.id });

            expect(invalidResponse.status).to.eqls(400);
            expect(validResponse.status).to.eqls(200);
        });

        it("Block is stored in db", async () => {
            const response = await supertest(app)
                .post(`/api/messenger/blocks`)
                .set({ accesstoken: globals.userToken })
                .send({ blockedId: user.id });

            expect(response.status).to.eqls(200);
            expect(response.body.data).to.has.property("block");

            const block = await globals.prisma.userBlock.findUnique({
                where: { id: response.body.data.block.id },
            });

            expect(block?.blockedId).to.eqls(user.id);
        });
    });

    describe("/api/messenger/blocks GET", () => {
        it("Return block list", async () => {
            const response = await supertest(app)
                .get(`/api/messenger/blocks`)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(200);
            expect(response.body.data).to.has.property("blockedUsers");
            expect(response.body.data.blockedUsers).to.be.an("array");
            expect(response.body.data.blockedUsers.length).to.be.greaterThan(0);
        });
    });

    describe("/api/messenger/blocks/rooms/:roomId GET", () => {
        let room: Room;

        before(async () => {
            room = await createFakeRoom(
                [
                    { userId: globals.userId, isAdmin: true },
                    { userId: user.id, isAdmin: false },
                ],
                { type: "private" }
            );
        });

        it("Return block for private room", async () => {
            const response = await supertest(app)
                .get(`/api/messenger/blocks/rooms/${room.id}`)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(200);
            expect(response.body.data).to.has.property("blocked");
            expect(response.body.data.blocked).not.to.be.null;
        });
    });

    describe("/api/messenger/blocks/:id DELETE", () => {
        let block: UserBlock;

        before(async () => {
            const user = await createFakeUser();
            block = await globals.prisma.userBlock.create({
                data: { userId: globals.userId, blockedId: user.id },
            });
        });

        it("Delete block by id", async () => {
            const response = await supertest(app)
                .delete(`/api/messenger/blocks/${block.id}`)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(200);
            expect(response.body.data).to.has.property("deleted");
            expect(response.body.data.deleted).to.be.true;
        });
    });

    describe("/api/messenger/blocks/userId/:userId DELETE", () => {
        let user: User;

        before(async () => {
            user = await createFakeUser();
            await globals.prisma.userBlock.create({
                data: { userId: globals.userId, blockedId: user.id },
            });
        });

        it("Delete block by userId", async () => {
            const response = await supertest(app)
                .delete(`/api/messenger/blocks/userId/${user.id}`)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(200);
            expect(response.body.data).to.has.property("deleted");
            expect(response.body.data.deleted).to.be.true;
        });
    });
});
