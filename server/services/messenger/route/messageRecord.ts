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
        reaction: yup.string().strict(),
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

                if (!Constants.MESSAGE_RECORD_VALID_TYPES.includes(type)) {
                    return res
                        .status(400)
                        .send(
                            errorResponse(
                                `Invalid type, allowed: ${Constants.MESSAGE_RECORD_VALID_TYPES.join(
                                    ","
                                )}`,
                                userReq.lang
                            )
                        );
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

                if (type === "reaction" && !reaction) {
                    return res
                        .status(400)
                        .send(
                            errorResponse(
                                "reaction field is required when type='reaction'",
                                userReq.lang
                            )
                        );
                }

                if (type === "reaction") {
                    // delete previous reaction
                    await prisma.messageRecord.deleteMany({
                        where: {
                            messageId,
                            type,
                            userId,
                        },
                    });
                }

                const messageRecord = await prisma.messageRecord.create({
                    data: {
                        messageId,
                        type,
                        userId,
                        ...(type === "reaction" && { reaction }),
                    },
                });

                const messageRecordSanitized = sanitize(messageRecord).messageRecord();

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
            });

            if (!messageRecord) {
                return res.status(404).send(errorResponse("Not found", userReq.lang));
            }

            await prisma.messageRecord.delete({ where: { id } });

            const messageRecordSanitized = sanitize(messageRecord).messageRecord();

            /*  sseMessageRecordsNotify(
                [messageRecordSanitized],
                Constants.PUSH_TYPE_DELETED_MESSAGE_RECORD
            ); */

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

        try {
            if (isNaN(lastUpdate)) {
                return res
                    .status(400)
                    .send(errorResponse("lastUpdate must be number", userReq.lang));
            }

            const roomsUser = await prisma.roomUser.findMany({ where: { userId } });
            const roomsIds = roomsUser.map((ru) => ru.roomId);

            const messageRecords = await prisma.messageRecord.findMany({
                where: {
                    createdAt: { gt: new Date(lastUpdate) },
                    message: {
                        roomId: { in: roomsIds },
                        createdAt: { gte: userReq.device.createdAt },
                    },
                },
            });

            const messageRecordsSanitized = messageRecords.map((messageRecord) =>
                sanitize(messageRecord).messageRecord()
            );

            res.send(successResponse({ messageRecords: messageRecordsSanitized }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    return router;
};
