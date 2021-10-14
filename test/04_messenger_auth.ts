import { expect } from "chai";
import supertest from "supertest";
import app from "../server";
import faker from "faker";

describe("API", () => {
  describe("/api/messenger/signup GET", () => {
    it("Get method doesnt work", async () => {
      const response = await supertest(app).get("/api/messenger/auth");
      expect(response.status).to.eqls(405);
    });
  });

  describe("/api/messenger/auth GET", () => {
    it("Get method doesnt work", async () => {
      const response = await supertest(app).get("/api/messenger/auth");
      expect(response.status).to.eqls(405);
    });
  });

  describe("/api/messenger/auth POST", () => {
    it("Telepohone numebr is missing", async () => {
      const response = await supertest(app)
        .post("/api/messenger/auth")
        .send({
          telephoneNumber: null,
          deviceId: faker.fake("{{random.alphaNumeric}}"),
        });

      expect(response.status).to.eqls(400);
    });

    it("DeviceId is missing", async () => {
      const response = await supertest(app)
        .post("/api/messenger/auth")
        .send({
          telephoneNumber: `+385${faker.fake("{{random.number}}")}`,
          deviceId: null,
        });

      expect(response.status).to.eqls(400);
    });

    it("New user", async () => {
      const response = await supertest(app)
        .post("/api/messenger/auth")
        .send({
          telephoneNumber: `+385${faker.fake("{{random.number}}")}`,
          deviceId: faker.fake("{{random.alphaNumeric}}"),
        });


      expect(response.status).to.eqls(200);
    });
  });
});
