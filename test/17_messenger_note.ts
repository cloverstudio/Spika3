import { Note, Room } from "@prisma/client";
import { expect } from "chai";
import supertest from "supertest";
import app from "../server";
import createFakeNote from "./fixtures/note";
import createFakeRoom from "./fixtures/room";
import globals from "./global";

describe("API", () => {
    let room: Room;

    before(async () => {
        room = await createFakeRoom([{ userId: globals.userId, isAdmin: true }]);
    });

    describe("/api/messenger/notes/roomId/:roomId POST", () => {
        it("Title is required", async () => {
            const invalidResponse = await supertest(app)
                .post(`/api/messenger/notes/roomId/${room.id}`)
                .set({ accesstoken: globals.userToken })
                .send({ content: "lalal" });

            const validResponse = await supertest(app)
                .post(`/api/messenger/notes/roomId/${room.id}`)
                .set({ accesstoken: globals.userToken })
                .send({ content: "lalal", title: "lala" });

            expect(invalidResponse.status).to.eqls(400);
            expect(validResponse.status).to.eqls(200);
        });

        it("Title max length is 136", async () => {
            const title = new Array(137).fill("a").join("");
            const invalidResponse = await supertest(app)
                .post(`/api/messenger/notes/roomId/${room.id}`)
                .set({ accesstoken: globals.userToken })
                .send({ title, content: "dsds" });

            const validResponse = await supertest(app)
                .post(`/api/messenger/notes/roomId/${room.id}`)
                .set({ accesstoken: globals.userToken })
                .send({ title: "lala", content: "dsds" });

            expect(invalidResponse.status).to.eqls(400);
            expect(validResponse.status).to.eqls(200);
        });

        it("Content is required", async () => {
            const invalidResponse = await supertest(app)
                .post(`/api/messenger/notes/roomId/${room.id}`)
                .set({ accesstoken: globals.userToken })
                .send({ title: "lalal" });

            const validResponse = await supertest(app)
                .post(`/api/messenger/notes/roomId/${room.id}`)
                .set({ accesstoken: globals.userToken })
                .send({ content: "lalal", title: "lala" });

            expect(invalidResponse.status).to.eqls(400);
            expect(validResponse.status).to.eqls(200);
        });

        it("User must be in room", async () => {
            const anotherRoom = await createFakeRoom([]);

            const response = await supertest(app)
                .post(`/api/messenger/notes/roomId/${anotherRoom.id}`)
                .set({ accesstoken: globals.userToken })
                .send({ content: "lalal", title: "lala" });

            expect(response.status).to.eqls(403);
        });

        it("Note is stored in db", async () => {
            const response = await supertest(app)
                .post(`/api/messenger/notes/roomId/${room.id}`)
                .set({ accesstoken: globals.userToken })
                .send({ content: "content", title: "title" });

            expect(response.status).to.eqls(200);
            expect(response.body.data).to.has.property("note");

            const noteFromDb = await globals.prisma.note.findUnique({
                where: { id: response.body.data.note.id },
            });

            expect(noteFromDb?.title).to.eqls("title");
            expect(noteFromDb?.content).to.eqls("content");
        });
    });

    describe("/api/messenger/notes/roomId/:roomId GET", () => {
        it("User must be in room", async () => {
            const anotherRoom = await createFakeRoom([]);

            const response = await supertest(app)
                .get(`/api/messenger/notes/roomId/${anotherRoom.id}`)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(403);
        });

        it("Return note list", async () => {
            const response = await supertest(app)
                .get(`/api/messenger/notes/roomId/${room.id}`)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(200);
            expect(response.body.data).to.has.property("notes");
            expect(response.body.data.notes).to.be.an("array");
            expect(response.body.data.notes.length).to.be.greaterThan(0);
        });
    });

    describe("/api/messenger/notes/:id GET", () => {
        it("User must be in room", async () => {
            const anotherRoom = await createFakeRoom([]);
            const anotherNote = await createFakeNote(anotherRoom.id);

            const response = await supertest(app)
                .get(`/api/messenger/notes/${anotherNote.id}`)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(403);
        });

        it("Returns note", async () => {
            const note = await createFakeNote(room.id);

            const response = await supertest(app)
                .get(`/api/messenger/notes/${note.id}`)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(200);
            expect(response.body.data).to.has.property("note");
            expect(response.body.data.note.id).to.eqls(note.id);
        });
    });

    describe("/api/messenger/notes/:id PUT", () => {
        let note: Note;

        before(async () => {
            note = await createFakeNote(room.id);
        });

        it("Title is required", async () => {
            const invalidResponse = await supertest(app)
                .put(`/api/messenger/notes/${note.id}`)
                .set({ accesstoken: globals.userToken })
                .send({ content: "lalal" });

            const validResponse = await supertest(app)
                .put(`/api/messenger/notes/${note.id}`)
                .set({ accesstoken: globals.userToken })
                .send({ content: "lalal", title: "lala" });

            expect(invalidResponse.status).to.eqls(400);
            expect(validResponse.status).to.eqls(200);
        });

        it("Title max length is 136", async () => {
            const title = new Array(137).fill("a").join("");
            const invalidResponse = await supertest(app)
                .put(`/api/messenger/notes/${note.id}`)
                .set({ accesstoken: globals.userToken })
                .send({ title, content: "dsds" });

            const validResponse = await supertest(app)
                .put(`/api/messenger/notes/${note.id}`)
                .set({ accesstoken: globals.userToken })
                .send({ title: "lala", content: "dsds" });

            expect(invalidResponse.status).to.eqls(400);
            expect(validResponse.status).to.eqls(200);
        });

        it("Content is required", async () => {
            const invalidResponse = await supertest(app)
                .put(`/api/messenger/notes/${note.id}`)
                .set({ accesstoken: globals.userToken })
                .send({ title: "lalal" });

            const validResponse = await supertest(app)
                .put(`/api/messenger/notes/${note.id}`)
                .set({ accesstoken: globals.userToken })
                .send({ content: "lalal", title: "lala" });

            expect(invalidResponse.status).to.eqls(400);
            expect(validResponse.status).to.eqls(200);
        });

        it("User must be in room", async () => {
            const anotherRoom = await createFakeRoom([]);
            const anotherNote = await createFakeNote(anotherRoom.id);

            const response = await supertest(app)
                .put(`/api/messenger/notes/${anotherNote.id}`)
                .set({ accesstoken: globals.userToken })
                .send({ content: "lalal", title: "lala" });

            expect(response.status).to.eqls(403);
        });

        it("Update is stored in db", async () => {
            const response = await supertest(app)
                .put(`/api/messenger/notes/${note.id}`)
                .set({ accesstoken: globals.userToken })
                .send({ content: "content", title: "title" });

            expect(response.status).to.eqls(200);
            expect(response.body.data).to.has.property("note");

            const noteFromDb = await globals.prisma.note.findUnique({
                where: { id: response.body.data.note.id },
            });

            expect(noteFromDb?.title).to.eqls("title");
            expect(noteFromDb?.content).to.eqls("content");
        });
    });
    describe("/api/messenger/notes/:id DELETE", () => {
        let note: Note;

        before(async () => {
            note = await createFakeNote(room.id);
        });

        it("User must be in room", async () => {
            const anotherRoom = await createFakeRoom([]);
            const anotherNote = await createFakeNote(anotherRoom.id);

            const response = await supertest(app)
                .delete(`/api/messenger/notes/${anotherNote.id}`)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(403);
        });

        it("Note must exist", async () => {
            const response = await supertest(app)
                .delete("/api/messenger/notes/568854545")
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(404);
        });

        it("Deleted from db", async () => {
            const response = await supertest(app)
                .delete(`/api/messenger/notes/${note.id}`)
                .set({ accesstoken: globals.userToken });

            expect(response.status).to.eqls(200);

            const noteFromDb = await globals.prisma.note.findUnique({ where: { id: note.id } });

            expect(noteFromDb).to.be.null;
        });
    });
});
