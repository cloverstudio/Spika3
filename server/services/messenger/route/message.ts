import { Router, Request, Response } from "express";
import { MessageRecord, PrismaClient } from "@prisma/client";
import amqp from "amqplib";

import { UserRequest } from "../lib/types";
import { error as le } from "../../../components/logger";

import auth from "../lib/auth";
import * as yup from "yup";
import validate from "../../../components/validateMiddleware";
import { successResponse, errorResponse } from "../../../components/response";
import { MESSAGE_ACTION_NEW_MESSAGE } from "../../../components/consts";
import * as Constants from "../../../components/consts";

import { InitRouterParams } from "../../types/serviceInterface";
import sanitize from "../../../components/sanitize";
import { formatMessageBody } from "../../../components/message";

const prisma = new PrismaClient();

const postMessageSchema = yup.object().shape({
    body: yup.object().shape({
        roomId: yup.number().strict().min(1).required(),
        type: yup.string().strict().required(),
        body: yup.object().required(),
        localId: yup.string().strict(),
    }),
});

const deliveredMessagesSchema = yup.object().shape({
    body: yup.object().shape({
        messagesIds: yup.array().default([]).of(yup.number().strict().moreThan(0)).required(),
    }),
});

export default ({ rabbitMQChannel }: InitRouterParams): Router => {
    const router = Router();

    router.post("/", auth, validate(postMessageSchema), async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        try {
            const roomId = parseInt(req.body.roomId as string);
            const type = req.body.type;
            const body = req.body.body;
            const localId = req.body.localId;
            const fromUserId = userReq.user.id;
            const fromDeviceId = userReq.device.id;

            const room = await prisma.room.findUnique({
                where: { id: roomId },
                include: { users: true },
            });

            if (!room) {
                return res.status(400).send(errorResponse("Room not found", userReq.lang));
            }

            const devices = await prisma.device.findMany({
                where: {
                    userId: { in: room.users.map((u) => u.userId) },
                },
            });

            const deviceMessages = devices.map((device) => ({
                deviceId: device.id,
                userId: device.userId,
                fromUserId,
                fromDeviceId,
                body,
                action: MESSAGE_ACTION_NEW_MESSAGE,
            }));

            const message = await prisma.message.create({
                data: {
                    type,
                    roomId,
                    fromUserId: userReq.user.id,
                    fromDeviceId: userReq.device.id,
                    totalUserCount: room.users.length,
                    localId,
                },
            });

            const formattedBody = await formatMessageBody(body, type);
            const sanitizedMessage = sanitize({ ...message, body: formattedBody }).message();

            res.send(successResponse({ message: sanitizedMessage }, userReq.lang));

            while (deviceMessages.length) {
                await Promise.all(
                    deviceMessages.splice(0, 10).map(async (deviceMessage) => {
                        await prisma.deviceMessage.create({
                            data: { ...deviceMessage, messageId: message.id },
                        });

                        rabbitMQChannel.sendToQueue(
                            Constants.QUEUE_PUSH,
                            Buffer.from(
                                JSON.stringify({
                                    type: Constants.PUSH_TYPE_NEW_MESSAGE,
                                    token: devices.find((d) => d.id == deviceMessage.deviceId)
                                        ?.pushToken,
                                    data: {
                                        message: sanitizedMessage,
                                    },
                                })
                            )
                        );

                        rabbitMQChannel.sendToQueue(
                            Constants.QUEUE_SSE,
                            Buffer.from(
                                JSON.stringify({
                                    channelId: deviceMessage.deviceId,
                                    data: {
                                        type: Constants.PUSH_TYPE_NEW_MESSAGE,
                                        message: sanitizedMessage,
                                    },
                                })
                            )
                        );
                    })
                );
            }
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.get("/:id/message-records", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const userId = userReq.user.id;

        try {
            const id = parseInt(req.params.id as string);

            const message = await prisma.message.findUnique({
                where: { id },
                include: { messageRecords: true },
            });

            if (!message) {
                return res.status(404).send(errorResponse("No message found", userReq.lang));
            }

            const roomUser = await prisma.roomUser.findFirst({
                where: { roomId: message.roomId, userId },
            });

            if (!roomUser) {
                return res.status(404).send(errorResponse("No message found", userReq.lang));
            }

            res.send(
                successResponse(
                    {
                        messageRecords: message.messageRecords.map((record) =>
                            sanitize(record).messageRecord()
                        ),
                    },
                    userReq.lang
                )
            );
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    // only web should call this route
    router.get("/roomId/:roomId", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const userId = userReq.user.id;
        const deviceId = userReq.device.id;
        const page = parseInt(req.query.page ? (req.query.page as string) : "") || 1;

        try {
            const roomId = parseInt(req.params.roomId as string);

            const count = await prisma.message.count({
                where: {
                    roomId,
                    deviceMessages: {
                        some: {
                            deviceId,
                        },
                    },
                },
            });

            const messages = await prisma.message.findMany({
                where: {
                    roomId,
                    deviceMessages: {
                        some: {
                            deviceId,
                        },
                    },
                },
                include: {
                    deviceMessages: true,
                    messageRecords: true,
                },
                orderBy: {
                    modifiedAt: "desc",
                },
                skip: Constants.PAGING_LIMIT * (page - 1),
                take: Constants.PAGING_LIMIT,
            });

            for (const message of messages) {
                const record = message.messageRecords.find(
                    (mr) => mr.type === "delivered" && mr.userId === userId
                );

                if (!record) {
                    try {
                        await prisma.messageRecord.create({
                            data: { type: "delivered", userId, messageId: message.id },
                        });

                        await prisma.message.update({
                            where: { id: message.id },
                            data: {
                                deliveredCount: { increment: 1 },
                            },
                        });

                        sseMessageRecordsNotify(
                            [sanitize(record).messageRecord()],
                            rabbitMQChannel
                        );
                    } catch (error) {
                        console.error({ error });
                    }
                }
            }

            const list = await Promise.all(
                messages.map(async (m) => {
                    const body = m.deviceMessages.find(
                        (dm) => dm.messageId === m.id && dm.deviceId === deviceId
                    )?.body;

                    const formattedBody = await formatMessageBody(body, m.type);
                    return sanitize({ ...m, body: formattedBody }).message();
                })
            );

            res.send(successResponse({ list, count, limit: Constants.PAGING_LIMIT }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.post(
        "/delivered",
        auth,
        validate(deliveredMessagesSchema),
        async (req: Request, res: Response) => {
            const userReq: UserRequest = req as UserRequest;
            const userId = userReq.user.id;
            const messagesIds = req.body.messagesIds as number[];

            try {
                const messages = await prisma.message.findMany({
                    where: { id: { in: messagesIds } },
                    include: { messageRecords: true },
                });

                if (!messages.length) {
                    return res
                        .status(400)
                        .send(errorResponse("No messages with given ids found", userReq.lang));
                }

                const notFoundMessagesIds = messagesIds.filter(
                    (id) => !messages.find((m) => m.id === id)
                );

                if (notFoundMessagesIds.length) {
                    return res
                        .status(400)
                        .send(
                            errorResponse(
                                `Messages with ids: ${notFoundMessagesIds.join(",")} not found`,
                                userReq.lang
                            )
                        );
                }

                const roomsIds = messages
                    .map((m) => m.roomId)
                    .filter((item, index, self) => self.indexOf(item) === index);

                const roomsUser = await prisma.roomUser.findMany({
                    where: { roomId: { in: roomsIds }, userId },
                });

                const notFoundRomsUser = roomsIds.filter(
                    (roomId) => !roomsUser.find((m) => m.roomId === roomId)
                );

                if (notFoundRomsUser.length) {
                    return res
                        .status(400)
                        .send(
                            errorResponse(
                                "One or more message is from room that user is not part of",
                                userReq.lang
                            )
                        );
                }

                const messageRecords: Partial<
                    Omit<MessageRecord, "createdAt" | "modifiedAt"> & {
                        createdAt: number;
                    }
                >[] = [];

                for (const message of messages) {
                    let record = await prisma.messageRecord.findUnique({
                        where: {
                            messageId_userId_type_unique_constraint: {
                                messageId: message.id,
                                type: "delivered",
                                userId,
                            },
                        },
                    });

                    if (!record) {
                        try {
                            record = await prisma.messageRecord.create({
                                data: { type: "delivered", userId, messageId: message.id },
                            });

                            await prisma.message.update({
                                where: { id: message.id },
                                data: {
                                    deliveredCount: { increment: 1 },
                                },
                            });

                            messageRecords.push(sanitize(record).messageRecord());
                        } catch (error) {
                            console.error({ error });
                        }
                    }
                }

                sseMessageRecordsNotify(messageRecords, rabbitMQChannel);

                res.send(successResponse({ messageRecords }, userReq.lang));
            } catch (e: any) {
                le(e);
                res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
            }
        }
    );

    router.get("/:timestamp", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const deviceId = userReq.device.id;
        const userId = userReq.user.id;

        const timestamp = parseInt(req.params.timestamp as string);
        const page = parseInt(req.query.page ? (req.query.page as string) : "") || 1;

        try {
            if (isNaN(timestamp)) {
                return res
                    .status(400)
                    .send(errorResponse("timestamp must be number", userReq.lang));
            }

            const count = await prisma.message.count({
                where: {
                    createdAt: { gte: new Date(timestamp) },
                    deviceMessages: {
                        some: {
                            deviceId,
                        },
                    },
                },
            });

            const messages = await prisma.message.findMany({
                where: {
                    createdAt: { gte: new Date(timestamp) },
                    deviceMessages: {
                        some: {
                            deviceId,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
                include: { deviceMessages: true },
                skip: Constants.PAGING_LIMIT * (page - 1),
                take: Constants.PAGING_LIMIT,
            });

            const list = messages.map((m) => {
                const body = m.deviceMessages.find((dm) => dm.deviceId === deviceId)?.body;
                return sanitize({ ...m, body }).message();
            });

            res.send(successResponse({ list, count, limit: Constants.PAGING_LIMIT }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.post("/:roomId/seen", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const userId = userReq.user.id;
        const roomId = parseInt(req.params.roomId as string);

        try {
            if (isNaN(roomId)) {
                return res.status(400).send(errorResponse("roomId must be number", userReq.lang));
            }

            const roomUser = await prisma.roomUser.findFirst({ where: { roomId, userId } });

            if (!roomUser) {
                return res
                    .status(400)
                    .send(errorResponse("user is not in this room", userReq.lang));
            }

            const messages = await prisma.message.findMany({
                where: {
                    roomId,
                    createdAt: { gte: roomUser.createdAt },
                    messageRecords: { none: { userId, type: "seen" } },
                },
            });

            const messageRecords: Partial<
                Omit<MessageRecord, "createdAt" | "modifiedAt"> & {
                    createdAt: number;
                }
            >[] = [];

            for (const message of messages) {
                let record = await prisma.messageRecord.findUnique({
                    where: {
                        messageId_userId_type_unique_constraint: {
                            messageId: message.id,
                            type: "seen",
                            userId,
                        },
                    },
                });

                if (!record) {
                    try {
                        record = await prisma.messageRecord.create({
                            data: { type: "seen", userId, messageId: message.id },
                        });

                        await prisma.message.update({
                            where: { id: message.id },
                            data: {
                                seenCount: { increment: 1 },
                            },
                        });

                        messageRecords.push(sanitize(record).messageRecord());
                    } catch (error) {
                        console.error({ error });
                    }
                }

                const deliveredMessageRecord = await prisma.messageRecord.findUnique({
                    where: {
                        messageId_userId_type_unique_constraint: {
                            messageId: message.id,
                            type: "delivered",
                            userId,
                        },
                    },
                });

                if (!deliveredMessageRecord) {
                    try {
                        await prisma.messageRecord.create({
                            data: { type: "delivered", userId, messageId: message.id },
                        });

                        await prisma.message.update({
                            where: { id: message.id },
                            data: {
                                deliveredCount: { increment: 1 },
                            },
                        });
                    } catch (error) {
                        console.error({ error });
                    }
                }
            }

            sseMessageRecordsNotify(messageRecords, rabbitMQChannel);

            res.send(successResponse({ messageRecords }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    return router;
};

async function sseMessageRecordsNotify(
    records: Partial<
        Omit<MessageRecord, "createdAt" | "modifiedAt"> & {
            createdAt: number;
        }
    >[],
    rabbitMQChannel: amqp.Channel | undefined | null
): Promise<void> {
    for (const record of records) {
        const devices = await prisma.deviceMessage.findMany({
            where: { messageId: record.messageId },
            select: { deviceId: true },
        });
        const deviceIds = devices.map((d) => d.deviceId);

        for (const deviceId of deviceIds) {
            rabbitMQChannel.sendToQueue(
                Constants.QUEUE_SSE,
                Buffer.from(
                    JSON.stringify({
                        channelId: deviceId,
                        data: {
                            type: Constants.PUSH_TYPE_NEW_MESSAGE,
                            messageRecord: record,
                        },
                    })
                )
            );
        }
    }
}
