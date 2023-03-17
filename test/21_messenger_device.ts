import { expect } from "chai";
import supertest from "supertest";
import app from "../server";
import globals from "./global";

describe("API", () => {
    describe("/api/messenger/device GET", () => {
        it("Returns users device", async () => {
            const response = await supertest(app)
                .get(`/api/messenger/device`)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(200);
            expect(response.body.data).to.has.property("device");
            expect(response.body.data.device).to.has.property("id");
            expect(response.body.data.device.id).to.be.eqls(globals.deviceId);
        });
    });

    describe("/api/messenger/device PUT", () => {
        it("Updates pushToken", async () => {
            const response = await supertest(app)
                .put(`/api/messenger/device`)
                .set({ accesstoken: globals.userToken })
                .send({ pushToken: "new token" });

            expect(response.status).to.eqls(200);
            expect(response.body.data).to.has.property("device");
            expect(response.body.data.device).to.has.property("id");
            expect(response.body.data.device).to.has.property("pushToken");
            expect(response.body.data.device.id).to.be.eqls(globals.deviceId);
            expect(response.body.data.device.pushToken).to.be.eqls("new token");
        });

        it("Can't update anything else than pushToken", async () => {
            const response = await supertest(app)
                .put(`/api/messenger/device`)
                .set({ accesstoken: globals.userToken })
                .send({ deviceId: "new id" });

            expect(response.status).to.eqls(200);
            expect(response.body.data).to.has.property("device");
            expect(response.body.data.device).to.has.property("id");
            expect(response.body.data.device).to.has.property("pushToken");
            expect(response.body.data.device.id).to.be.eqls(globals.deviceId);
            expect(response.body.data.device.pushToken).to.be.eqls("new token");
        });
    });
});
