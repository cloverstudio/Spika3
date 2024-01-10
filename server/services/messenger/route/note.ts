import { Router, Request, Response } from "express";

import { UserRequest } from "../lib/types";
import * as yup from "yup";
import validate from "../../../components/validateMiddleware";

import { error as le } from "../../../components/logger";
import * as Constants from "../../../components/consts";

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

export default ({ rabbitMQChannel }: InitRouterParams): Router => {
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
                    include: {
                        room: {
                            include: {
                                users: true,
                            },
                        },
                    },
                });

                if (!roomUser) {
                    return res
                        .status(403)
                        .send(
                            errorResponse(
                                "You can't create chat note because you are not participant in that chat.",
                                userReq.lang,
                            ),
                        );
                }

                const note = await prisma.note.create({ data: { roomId, content, title } });

                const message = await prisma.message.create({
                    data: {
                        type: Constants.SYSTEM_MESSAGE_TYPE,
                        roomId,
                        fromUserId: userReq.user.id,
                        totalUserCount: 0,
                        deliveredCount: 0,
                        seenCount: 0,
                    },
                });

                const sanitizedMessage = sanitize({
                    ...message,
                    body: {
                        text: `${userReq.user.displayName} created note ${title}`,
                        subject: userReq.user.displayName,
                        subjectId: userReq.user.id,
                        type: Constants.SYSTEM_MESSAGE_TYPE_CREATE_NOTE,
                        object: title,
                        objectIds: [ note.id ]
                    },
                }).message();

                rabbitMQChannel.sendToQueue(
                    Constants.QUEUE_MESSAGES_SSE,
                    Buffer.from(
                        JSON.stringify({
                            room: roomUser.room,
                            message: sanitizedMessage,
                        }),
                    ),
                );

                res.send(successResponse({ note: sanitize(note).note() }, userReq.lang));
            } catch (e: unknown) {
                le(e);
                res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
            }
        },
    );

    router.get("/roomId/:roomId", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        try {
            const roomId = parseInt(req.params.roomId || "");

            const roomUser = await prisma.roomUser.findFirst({
                where: { userId: userReq.user.id, roomId },
            });

            if (!roomUser) {
                return res
                    .status(403)
                    .send(
                        errorResponse(
                            "You can't see chat notes because you are not participant in that chat.",
                            userReq.lang,
                        ),
                    );
            }

            const notes = await prisma.note.findMany({ where: { roomId } });

            res.send(
                successResponse({ notes: notes.map((n) => sanitize(n).note()) }, userReq.lang),
            );
        } catch (e: unknown) {
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
                return res.status(404).send(errorResponse("Note not found", userReq.lang));
            }

            const roomUser = await prisma.roomUser.findFirst({
                where: { userId: userReq.user.id, roomId: note.roomId },
            });

            if (!roomUser) {
                return res
                    .status(403)
                    .send(
                        errorResponse(
                            "You can't see chat note because you are not participant in that chat.",
                            userReq.lang,
                        ),
                    );
            }

            res.send(successResponse({ note: sanitize(note).note() }, userReq.lang));
        } catch (e: unknown) {
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
                include: {
                    room: {
                        include: {
                            users: true,
                        },
                    },
                },
            });

            if (!roomUser) {
                return res
                    .status(403)
                    .send(
                        errorResponse(
                            "You can't update chat note because you are not participant in that chat.",
                            userReq.lang,
                        ),
                    );
            }

            const updated = await prisma.note.update({
                where: { id },
                data: { title: title, content: content, modifiedAt: new Date() },
            });

            const message = await prisma.message.create({
                data: {
                    type: Constants.SYSTEM_MESSAGE_TYPE,
                    roomId: note.roomId,
                    fromUserId: userReq.user.id,
                    totalUserCount: 0,
                    deliveredCount: 0,
                    seenCount: 0,
                },
            });

            const sanitizedMessage = sanitize({
                ...message,
                body: {
                    text: `${userReq.user.displayName} updated note ${title}`,
                    subject: userReq.user.displayName,
                    subjectId: userReq.user.id,
                    type: Constants.SYSTEM_MESSAGE_TYPE_UPDATE_NOTE,
                    object: title,
                    objectIds: [ updated.id ]
                },
            }).message();

            rabbitMQChannel.sendToQueue(
                Constants.QUEUE_MESSAGES_SSE,
                Buffer.from(
                    JSON.stringify({
                        room: roomUser.room,
                        message: sanitizedMessage,
                    }),
                ),
            );

            res.send(successResponse({ note: sanitize(updated).note() }, userReq.lang));
        } catch (e: unknown) {
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
                include: {
                    room: {
                        include: {
                            users: true,
                        },
                    },
                },
            });

            if (!roomUser) {
                return res
                    .status(403)
                    .send(
                        errorResponse(
                            "You can't delete chat note because you are not participant in that chat.",
                            userReq.lang,
                        ),
                    );
            }

            await prisma.note.delete({ where: { id } });

            const message = await prisma.message.create({
                data: {
                    type: Constants.SYSTEM_MESSAGE_TYPE,
                    roomId: note.roomId,
                    fromUserId: userReq.user.id,
                    totalUserCount: 0,
                    deliveredCount: 0,
                    seenCount: 0,
                },
            });

            const sanitizedMessage = sanitize({
                ...message,
                body: {
                    text: `${userReq.user.displayName} deleted note ${note.title}`,
                    subject: userReq.user.displayName,
                    subjectId: userReq.user.id,
                    type: Constants.SYSTEM_MESSAGE_TYPE_DELETE_NOTE,
                    object: note.title,
                    objectId: [ id ]
                },
            }).message();

            rabbitMQChannel.sendToQueue(
                Constants.QUEUE_MESSAGES_SSE,
                Buffer.from(
                    JSON.stringify({
                        room: roomUser.room,
                        message: sanitizedMessage,
                    }),
                ),
            );

            res.send(successResponse({ deleted: true }, userReq.lang));
        } catch (e: unknown) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    return router;
};
