import { expect } from "chai";
import supertest from "supertest";
import app from "../server";
import globals from "./global";

describe("API", () => {
    describe("/api/messenger/note/:roomId GET", () => {
        it("Messenger get note api works", async () => {
            const response = await supertest(app).get(`/api/messenger/note/${globals.roomId}`);
            expect(response.status).to.eqls(200);
        });

        it("Messenger save note api works", async () => {
            const response = await supertest(app).get(`/api/messenger/note/${globals.roomId}`);
            expect(response.status).to.eqls(200);
        });
    });
});
