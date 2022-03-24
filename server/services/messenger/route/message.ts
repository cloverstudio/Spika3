import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

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

const prisma = new PrismaClient();

const postMessageSchema = yup.object().shape({
    body: yup.object().shape({
        roomId: yup.number().strict().min(1).required(),
        type: yup.string().strict().required(),
        message: yup.object().required(),
    }),
});

export default ({ rabbitMQChannel }: InitRouterParams): Router => {
    const router = Router();

    router.post("/", auth, validate(postMessageSchema), async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        try {
            const roomId = parseInt(req.body.roomId as string);
            const type = req.body.type;
            const body = req.body.message;
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
                    totalDeviceCount: deviceMessages.length,
                    totalUserCount: room.users.length,
                },
            });

            res.send(
                successResponse({ message: sanitize({ ...message, body }).message() }, userReq.lang)
            );

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
                                        deviceMessage,
                                        message: sanitize({ ...message, body }).message(),
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
                                        deviceMessage,
                                        message: sanitize({ ...message, body }).message(),
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
                orderBy: {
                    modifiedAt: "desc",
                },
                skip: Constants.PAGING_LIMIT * (page - 1),
                take: Constants.PAGING_LIMIT,
            });

            const deviceMessages = await prisma.deviceMessage.findMany({
                where: { userId, deviceId, messageId: { in: messages.map((m) => m.id) } },
                select: {
                    messageId: true,
                    body: true,
                },
            });

            const list = messages.map((m) => {
                const body = deviceMessages.find((dm) => dm.messageId === m.id)?.body;
                return sanitize({ ...m, body }).message();
            });

            res.send(successResponse({ list, count, limit: Constants.PAGING_LIMIT }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

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

            for (const message of messages) {
                const query = { messageId: message.id, type: "delivered", userId };

                const exists = await prisma.messageRecord.findFirst({
                    where: query,
                });

                if (!exists) {
                    await prisma.messageRecord.create({
                        data: query,
                    });
                }
            }

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
                select: { id: true },
            });

            const messagesIds = messages.map((m) => m.id);

            const messageRecords = await prisma.messageRecord.createMany({
                data: messagesIds.map((messageId) => ({ messageId, userId, type: "seen" })),
            });

            res.send(successResponse({ messageRecords }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.post("/:messageId/delivered", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const userId = userReq.user.id;
        const messageId = parseInt(req.params.messageId as string);

        try {
            if (isNaN(messageId)) {
                return res
                    .status(400)
                    .send(errorResponse("messageId must be number", userReq.lang));
            }

            const message = await prisma.message.findUnique({
                where: { id: messageId },
                include: { messageRecords: true },
            });

            if (!message) {
                return res.status(404).send(errorResponse("message not found", userReq.lang));
            }

            const roomUser = await prisma.roomUser.findFirst({
                where: { roomId: message.roomId, userId },
            });

            if (!roomUser) {
                return res.status(404).send(errorResponse("message not found", userReq.lang));
            }

            let record = message.messageRecords.find(
                (mr) => mr.type === "delivered" && mr.userId === userId
            );

            if (!record) {
                record = await prisma.messageRecord.create({
                    data: { type: "delivered", userId, messageId },
                });
            }

            res.send(successResponse({ record }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    return router;
};
