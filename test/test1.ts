import { expect } from "chai";
import supertest from "supertest";
import app from "../server";

describe("API", () => {
    describe("/api/test GET", () => {
        it("Test api works", async () => {
            const response = await supertest(app).get("/api/test");
            expect(response.status).to.eqls(200);
            expect(response.text).to.equal("test");
        });
    });
});
