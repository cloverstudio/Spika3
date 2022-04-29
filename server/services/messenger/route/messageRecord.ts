import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

import { UserRequest } from "../lib/types";
import { error as le } from "../../../components/logger";

import auth from "../lib/auth";
import * as yup from "yup";
import validate from "../../../components/validateMiddleware";
import { successResponse, errorResponse } from "../../../components/response";
import { MESSAGE_RECORD_VALID_TYPES } from "../../../components/consts";

import { InitRouterParams } from "../../types/serviceInterface";
import sanitize from "../../../components/sanitize";
import sseMessageRecordsNotify from "../lib/sseMessageRecordsNotify";

const prisma = new PrismaClient();

const postMessageRecordSchema = yup.object().shape({
    body: yup.object().shape({
        messageId: yup.number().strict().min(1).required(),
        type: yup.string().strict().required(),
        reaction: yup.string().strict(),
    }),
});

export default ({ rabbitMQChannel }: InitRouterParams): Router => {
    const router = Router();

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

                if (!MESSAGE_RECORD_VALID_TYPES.includes(type)) {
                    return res
                        .status(400)
                        .send(
                            errorResponse(
                                `Invalid type, allowed: ${MESSAGE_RECORD_VALID_TYPES.join(",")}`,
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

                const messageRecord = await prisma.messageRecord.create({
                    data: {
                        messageId,
                        type,
                        userId,
                        ...(type === "reaction" && { reaction }),
                    },
                });

                const messageRecordSanitized = sanitize(messageRecord).messageRecord();

                sseMessageRecordsNotify([messageRecordSanitized], rabbitMQChannel);

                res.send(successResponse({ messageRecord: messageRecordSanitized }, userReq.lang));
            } catch (e: any) {
                le(e);
                res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
            }
        }
    );

    router.get("/sync/:lastUpdate", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const deviceId = userReq.device.id;
        const lastUpdate = parseInt(req.params.lastUpdate as string);

        try {
            if (isNaN(lastUpdate)) {
                return res
                    .status(400)
                    .send(errorResponse("lastUpdate must be number", userReq.lang));
            }

            const messages = await prisma.message.findMany({
                where: {
                    createdAt: { gte: new Date(lastUpdate) },
                    deviceMessages: {
                        some: {
                            deviceId,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
                select: {
                    id: true,
                },
            });

            const messagesIds = messages.map((m) => m.id);

            if (!messagesIds.length) {
                return res.send(successResponse({ messageRecords: [] }, userReq.lang));
            }

            const messageRecords = await prisma.messageRecord.findMany({
                where: {
                    messageId: { in: messagesIds },
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
