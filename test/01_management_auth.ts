import { expect } from "chai";
import supertest from "supertest";
import app from "../server";

import globals from "./global";

describe("Admin auth API", () => {
  describe("/api/management/auth GET", () => {
    it("Should work", async () => {
      const response = await supertest(app).get("/api/management/auth");
      expect(response.status).to.eqls(200);
    });
  });

  describe("/api/management/auth POST", () => {
    it("Signin as admin", async () => {
      const response = await supertest(app).post("/api/management/auth").send({
        username: "admin",
        password: "password",
      });

      globals.adminToken = response.body.token;

      expect(response.status).to.eqls(200);
    });

    it("Signin as admin failed", async () => {
      const response = await supertest(app).post("/api/management/auth").send({
        username: "admin_",
        password: "password",
      });

      expect(response.status).to.eqls(403);
    });
  });
});
