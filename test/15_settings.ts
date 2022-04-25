import { expect } from "chai";
import supertest from "supertest";
import app from "../server";

describe("API", () => {
    describe("/api/messenger/settings GET", () => {
        it("Test api works", async () => {
            const response = await supertest(app).get("/api/messenger/settings");
            expect(response.status).to.eqls(200);
            expect(response.body.data).to.has.property("teamMode");
        });
    });
});
