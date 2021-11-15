import { expect } from "chai";
import supertest from "supertest";
import app from "../server";

describe("API", () => {
    describe("/api/messenger/test GET", () => {
        it("Messenger test api works", async () => {
            const response = await supertest(app).get("/api/messenger/test");
            expect(response.status).to.eqls(200);
            expect(response.body.data).to.equal("test");
        });
    });
});
