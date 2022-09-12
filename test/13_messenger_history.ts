import { expect } from "chai";
import supertest from "supertest";
import app from "../server";
import globals from "./global";
import createFakeDevice from "./fixtures/device";
import createFakeRoom from "./fixtures/room";
import { beforeEach } from "mocha";
import createFakeUser, { createManyFakeUsers } from "./fixtures/user";
import { RoomUser, Room } from ".prisma/client";

describe("API", () => {
    describe("/api/messenger/history GET", () => {
        it("returns room list without lastMessage if user doesn't have any device messages", async () => {
            const newDevice = await createFakeDevice(globals.userId);

            const response = await supertest(app)
                .get("/api/messenger/rooms")
                .set({ accesstoken: newDevice.token });

            expect(response.status).to.eqls(200);
            expect(response.body).to.has.property("data");
            expect(response.body.data).to.has.property("list");
            expect(response.body.data.list).to.be.an("array");
            expect(response.body.data.list.filter((r: any) => r.lastMessage)).to.have.length(0);
        });

        it("Filter by keyword works", async () => {
            const newDevice = await createFakeDevice(globals.userId);

            const response = await supertest(app)
                .get("/api/messenger/rooms?keyword=randomstring")
                .set({ accesstoken: newDevice.token });

            expect(response.status).to.eqls(200);
            expect(response.body).to.has.property("data");
            expect(response.body.data).to.has.property("list");
            expect(response.body.data.list.length).to.eqls(0);
        });
    });
});
