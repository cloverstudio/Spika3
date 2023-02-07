import { Router, Request, Response } from "express";

import { UserRequest } from "../lib/types";
import * as yup from "yup";
import validate from "../../../components/validateMiddleware";

import { error as le } from "../../../components/logger";
import auth from "../lib/auth";
import { InitRouterParams } from "../../types/serviceInterface";
import { successResponse, errorResponse } from "../../../components/response";
import sanitize from "../../../components/sanitize";
import prisma from "../../../components/prisma";

const createNoteSchema = yup.object().shape({
    body: yup.object().shape({
        title: yup.string().min(1).max(135).strict().required(),
        content: yup.string().min(1).strict().required(),
    }),
});

export default ({}: InitRouterParams): Router => {
    const router = Router();

    router.post(
        "/roomId/:roomId",
        auth,
        validate(createNoteSchema),
        async (req: Request, res: Response) => {
            const userReq: UserRequest = req as UserRequest;

            try {
                const { content, title } = req.body;
                const roomId = parseInt(req.params.roomId || "");

                const roomUser = await prisma.roomUser.findFirst({
                    where: { userId: userReq.user.id, roomId },
                });

                if (!roomUser) {
                    return res
                        .status(403)
                        .send(errorResponse("User must be in room", userReq.lang));
                }

                const note = await prisma.note.create({ data: { roomId, content, title } });

                res.send(successResponse({ note: sanitize(note).note() }, userReq.lang));
            } catch (e: any) {
                le(e);
                res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
            }
        }
    );

    router.get("/roomId/:roomId", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        try {
            const roomId = parseInt(req.params.roomId || "");

            const roomUser = await prisma.roomUser.findFirst({
                where: { userId: userReq.user.id, roomId },
            });

            if (!roomUser) {
                return res.status(403).send(errorResponse("User must be in room", userReq.lang));
            }

            const notes = await prisma.note.findMany({ where: { roomId } });

            res.send(
                successResponse({ notes: notes.map((n) => sanitize(n).note()) }, userReq.lang)
            );
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.get("/:id", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        try {
            const id = parseInt(req.params.id || "");

            const note = await prisma.note.findUnique({ where: { id } });

            if (!note) {
                return res.status(404).send(errorResponse("Not found", userReq.lang));
            }

            const roomUser = await prisma.roomUser.findFirst({
                where: { userId: userReq.user.id, roomId: note.roomId },
            });

            if (!roomUser) {
                return res.status(403).send(errorResponse("User must be in room", userReq.lang));
            }

            res.send(successResponse({ note: sanitize(note).note() }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.put("/:id", auth, validate(createNoteSchema), async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        try {
            const { content, title } = req.body;
            const id = parseInt(req.params.id || "");

            const note = await prisma.note.findUnique({ where: { id } });

            if (!note) {
                return res.status(404).send(errorResponse("Not found", userReq.lang));
            }

            const roomUser = await prisma.roomUser.findFirst({
                where: { userId: userReq.user.id, roomId: note.roomId },
            });

            if (!roomUser) {
                return res.status(403).send(errorResponse("User must be in room", userReq.lang));
            }

            const updated = await prisma.note.update({
                where: { id },
                data: { title, content },
            });

            res.send(successResponse({ note: sanitize(updated).note() }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.delete("/:id", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        try {
            const id = parseInt(req.params.id || "");

            const note = await prisma.note.findUnique({ where: { id } });

            if (!note) {
                return res.status(404).send(errorResponse("Not found", userReq.lang));
            }

            const roomUser = await prisma.roomUser.findFirst({
                where: { userId: userReq.user.id, roomId: note.roomId },
            });

            if (!roomUser) {
                return res.status(403).send(errorResponse("User must be in room", userReq.lang));
            }

            await prisma.note.delete({ where: { id } });

            res.send(successResponse({ deleted: true }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    return router;
};
