import { expect } from "chai";
import supertest from "supertest";
import app from "../server";
import globals from "./global";
import createFakeUser, { createManyFakeUsers } from "./fixtures/user";
import { User } from ".prisma/client";
import * as Constants from "../server/components/consts";
import createFakeContacts from "./fixtures/contact";

const wait = (s: number): Promise<void> => {
  return new Promise<void>((res) => {
    setTimeout(() => {
      res();
    }, s);
  });
};

describe("API", () => {
  const users: User[] = [];

  before(async () => {
    users.push(...(await createManyFakeUsers(10)));
  });

  describe("/api/messenger/contacts GET", () => {
    it("Works without any params", async () => {
      const response = await supertest(app)
        .get("/api/messenger/contacts")
        .set({ accesstoken: globals.userToken });

      expect(response.status).to.eqls(200);
      expect(response.body).to.has.property("list");
      expect(response.body).to.has.property("count");
      expect(response.body).to.has.property("limit");
      expect(response.body.limit).to.eqls(Constants.PAGING_LIMIT);
    });

    it("Accepts page query", async () => {
      const contacts = await createFakeContacts({
        userId: globals.userId,
        contacts: users,
      });

      const response = await supertest(app)
        .get("/api/messenger/contacts?page=2")
        .set({ accesstoken: globals.userToken });

      expect(response.status).to.eqls(200);
      expect(response.body).to.has.property("list");
      expect(response.body).to.has.property("count");
      expect(response.body).to.has.property("limit");
      expect(response.body.limit).to.eqls(Constants.PAGING_LIMIT);
      expect(response.body.count).to.eqls(contacts.count);
      expect(response.body.list.length === 0).to.eqls(
        contacts.count > Constants.PAGING_LIMIT ? false : true
      );
    });
  });

  describe("/api/messenger/contacts POST", () => {
    it("Contacts param must be string or array of strings", async () => {
      const responseContactsUndefined = await supertest(app)
        .post("/api/messenger/contacts")
        .set({ accesstoken: globals.userToken });

      const responseContactsBool = await supertest(app)
        .post("/api/messenger/contacts")
        .set({ accesstoken: globals.userToken })
        .send({ contacts: true });

      const responseContactsNum = await supertest(app)
        .post("/api/messenger/contacts")
        .set({ accesstoken: globals.userToken })
        .send({ contacts: 42 });

      const responseContactsArrayOfNum = await supertest(app)
        .post("/api/messenger/contacts")
        .set({ accesstoken: globals.userToken })
        .send({ contacts: [42] });

      const responseContactsArrayOfStrings = await supertest(app)
        .post("/api/messenger/contacts")
        .set({ accesstoken: globals.userToken })
        .send({ contacts: ["42"] });

      const responseContactsString = await supertest(app)
        .post("/api/messenger/contacts")
        .set({ accesstoken: globals.userToken })
        .send({ contacts: "42" });

      expect(responseContactsUndefined.status).to.eqls(400);
      expect(responseContactsBool.status).to.eqls(400);
      expect(responseContactsNum.status).to.eqls(400);
      expect(responseContactsArrayOfNum.status).to.eqls(400);
      expect(responseContactsArrayOfStrings.status).to.eqls(200);
      expect(responseContactsString.status).to.eqls(200);
    });

    it("Contacts param must have at least one hash", async () => {
      const responseContactsInvalidLength = await supertest(app)
        .post("/api/messenger/contacts")
        .set({ accesstoken: globals.userToken })
        .send({ contacts: [] });

      const responseContactsValidLengthString = await supertest(app)
        .post("/api/messenger/contacts")
        .set({ accesstoken: globals.userToken })
        .send({ contacts: "42" });

      const responseContactsValidLengthArray = await supertest(app)
        .post("/api/messenger/contacts")
        .set({ accesstoken: globals.userToken })
        .send({ contacts: ["42"] });

      expect(responseContactsInvalidLength.status).to.eqls(400);
      expect(responseContactsValidLengthString.status).to.eqls(200);
      expect(responseContactsValidLengthArray.status).to.eqls(200);
    });

    it("Contacts param must respect max length", async () => {
      const responseContactsInvalidLength = await supertest(app)
        .post("/api/messenger/contacts")
        .set({ accesstoken: globals.userToken })
        .send({
          contacts: Array(Constants.CONTACT_SYNC_LIMIT + 1)
            .fill("hash")
            .map((h) => h),
        });

      const responseContactsValidLength = await supertest(app)
        .post("/api/messenger/contacts")
        .set({ accesstoken: globals.userToken })
        .send({
          contacts: Array(Constants.CONTACT_SYNC_LIMIT)
            .fill("hash")
            .map((h) => h),
        });

      expect(responseContactsInvalidLength.status).to.eqls(400);
      expect(responseContactsValidLength.status).to.eqls(200);
    });

    it("Returns a list of existing verified users", async () => {
      const nonVerifiedUser = await createFakeUser({ verified: false });
      const response = await supertest(app)
        .post("/api/messenger/contacts")
        .set({ accesstoken: globals.userToken })
        .send({
          contacts: [
            ...users.map((u) => u.telephoneNumberHashed),
            "fakeHash",
            nonVerifiedUser.telephoneNumberHashed,
          ],
        });

      expect(response.status).to.eqls(200);
      expect(response.body).to.has.property("list");
      expect(response.body).to.has.property("count");
      expect(response.body).to.has.property("limit");
      expect(response.body.limit).to.eqls(Constants.CONTACT_SYNC_LIMIT);
      expect(response.body.count).to.eqls(users.length);
      expect(response.body.list.length).to.eqls(users.length);
      expect(
        response.body.list.some((u: User) => u.verified === false)
      ).to.eqls(false);
    });

    it("Create contact record for every existing verified users", async () => {
      // not sure about how to wait for rabbitMq workers to finish adding contacts
      // this bellow seems to be working but not sure if it is the best way
      await wait(500);

      const contacts = await globals.prisma.contact.findMany({
        where: { userId: globals.userId },
      });

      expect(
        users.every((u) => contacts.map((c) => c.contactId).includes(u.id))
      ).to.eqls(true);
    });
  });
});
