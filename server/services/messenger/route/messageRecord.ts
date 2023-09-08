import { Router, Request, Response } from "express";

import { UserRequest } from "../lib/types";
import { error as le } from "../../../components/logger";

import auth from "../lib/auth";
import * as yup from "yup";
import validate from "../../../components/validateMiddleware";
import { successResponse, errorResponse } from "../../../components/response";
import * as Constants from "../../../components/consts";

import { InitRouterParams } from "../../types/serviceInterface";
import sanitize from "../../../components/sanitize";
import createSSEMessageRecordsNotify from "../lib/sseMessageRecordsNotify";
import prisma from "../../../components/prisma";
import { isRoomBlocked } from "./block";

const postMessageRecordSchema = yup.object().shape({
    body: yup.object().shape({
        messageId: yup.number().strict().min(1).required(),
        type: yup.string().strict().required(),
        reaction: yup.string().strict().required(),
    }),
});

export default ({ rabbitMQChannel }: InitRouterParams): Router => {
    const router = Router();
    const sseMessageRecordsNotify = createSSEMessageRecordsNotify(rabbitMQChannel);

    router.post(
        "/",
        auth,
        validate(postMessageRecordSchema),
        async (req: Request, res: Response) => {
            const userReq: UserRequest = req as UserRequest;

            try {
                const messageId = parseInt(req.body.messageId as string);
                const type = req.body.type;
                const reaction = req.body.reaction;
                const userId = userReq.user.id;

                if (type !== "reaction") {
                    return res.status(400).send(errorResponse("Invalid mr type", userReq.lang));
                }

                const message = await prisma.message.findUnique({
                    where: { id: messageId },
                });

                if (!message) {
                    return res.status(404).send(errorResponse("Message not found", userReq.lang));
                }

                const blocked = await isRoomBlocked(message.roomId, userReq.user.id);

                if (blocked) {
                    return res.status(403).send(errorResponse("Room is blocked", userReq.lang));
                }

                let messageRecord;

                const currentReaction = await prisma.messageRecord.findFirst({
                    where: {
                        messageId,
                        type,
                        userId,
                    },
                });

                if (currentReaction) {
                    await prisma.messageRecord.update({
                        where: { id: currentReaction.id },
                        data: {
                            reaction,
                            modifiedAt: new Date(),
                            isDeleted: false,
                        },
                    });

                    messageRecord = await prisma.messageRecord.findUnique({
                        where: { id: currentReaction.id },
                    });
                } else {
                    messageRecord = await prisma.messageRecord.create({
                        data: {
                            messageId,
                            type,
                            userId,
                            reaction,
                        },
                    });
                }

                const messageRecordSanitized = sanitize({
                    ...messageRecord,
                    roomId: message.roomId,
                }).messageRecord();

                const messageRecordsNotifyData = {
                    types: [type],
                    userId,
                    messageIds: [message.id],
                    pushType: Constants.PUSH_TYPE_NEW_MESSAGE_RECORD,
                    reaction,
                    justNotify: true,
                };

                sseMessageRecordsNotify(messageRecordsNotifyData);

                res.send(successResponse({ messageRecord: messageRecordSanitized }, userReq.lang));
            } catch (e: any) {
                le(e);
                res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
            }
        }
    );

    router.delete("/:id", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const userId = userReq.user.id;

        try {
            const id = parseInt(req.params.id as string);

            const messageRecord = await prisma.messageRecord.findFirst({
                where: { id, userId },
                include: {
                    message: true,
                },
            });

            if (!messageRecord) {
                return res.status(404).send(errorResponse("Not found", userReq.lang));
            }

            if (messageRecord.type !== "reaction") {
                return res
                    .status(404)
                    .send(errorResponse("Only reactions can be deleted", userReq.lang));
            }

            const updatedFields = {
                isDeleted: true,
                reaction: "Deleted reaction",
                modifiedAt: new Date(),
            };

            await prisma.messageRecord.update({
                where: { id },
                data: updatedFields,
            });

            const messageRecordSanitized = sanitize({
                ...messageRecord,
                ...updatedFields,
                roomId: messageRecord.message.roomId,
            }).messageRecord();

            const messageRecordsNotifyData = {
                types: [messageRecord.type],
                userId,
                messageIds: [messageRecord.message.id],
                pushType: Constants.PUSH_TYPE_DELETED_MESSAGE_RECORD,
                justNotify: true,
            };
            sseMessageRecordsNotify(messageRecordsNotifyData);

            res.send(successResponse({ messageRecord: messageRecordSanitized }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.get("/sync/:lastUpdate", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const userId = userReq.user.id;
        const lastUpdate = parseInt(req.params.lastUpdate as string);
        const page = parseInt((req.query.page as string) || "1");

        try {
            if (isNaN(lastUpdate)) {
                return res
                    .status(400)
                    .send(errorResponse("lastUpdate must be number", userReq.lang));
            }

            if (isNaN(page)) {
                return res
                    .status(400)
                    .send(errorResponse("page must be valid number", userReq.lang));
            }

            const roomsUser = await prisma.roomUser.findMany({ where: { userId } });
            const roomsIds = roomsUser.map((ru) => ru.roomId);

            const messageRecords = await prisma.messageRecord.findMany({
                where: {
                    modifiedAt: { gt: new Date(lastUpdate) },
                    message: {
                        roomId: { in: roomsIds },
                        modifiedAt: { gte: userReq.device.createdAt },
                    },
                },
                take: Constants.SYNC_LIMIT,
                skip: (page - 1) * Constants.SYNC_LIMIT,
                include: { message: true },
                orderBy: { modifiedAt: "asc" },
            });

            const count = await prisma.messageRecord.count({
                where: {
                    modifiedAt: { gt: new Date(lastUpdate) },
                    message: {
                        roomId: { in: roomsIds },
                        modifiedAt: { gte: userReq.device.createdAt },
                    },
                },
            });

            const messageRecordsSanitized = messageRecords.map((messageRecord) => ({
                ...sanitize({
                    ...messageRecord,
                    roomId: messageRecord.message.roomId,
                }).messageRecord(),
                message: {
                    id: messageRecord.message.id,
                    totalUserCount: messageRecord.message.totalUserCount,
                    deliveredCount: messageRecord.message.deliveredCount,
                    seenCount: messageRecord.message.seenCount,
                    roomId: messageRecord.message.roomId,
                },
            }));

            const hasNext = count > page * Constants.SYNC_LIMIT;

            res.send(
                successResponse(
                    {
                        list: messageRecordsSanitized,
                        limit: Constants.SYNC_LIMIT,
                        count,
                        hasNext,
                        messageRecords: messageRecordsSanitized,
                    },
                    userReq.lang
                )
            );
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    return router;
};
