import { Router, Request, Response } from "express";
import { MessageRecord } from "@prisma/client";

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
import createSSEMessageRecordsNotify from "../lib/sseMessageRecordsNotify";
import prisma from "../../../components/prisma";
import { isRoomBlocked } from "./block";
import { handleNewMessage } from "../../../components/chatGPT";

const postMessageSchema = yup.object().shape({
    body: yup.object().shape({
        roomId: yup.number().strict().min(1).required(),
        type: yup.string().strict().required(),
        body: yup.object().required(),
        localId: yup.string().strict(),
        replyId: yup.number().strict(),
    }),
});

const deliveredMessagesSchema = yup.object().shape({
    body: yup.object().shape({
        messagesIds: yup.array().default([]).of(yup.number().strict().moreThan(0)).required(),
    }),
});

export default ({ rabbitMQChannel }: InitRouterParams): Router => {
    const router = Router();
    const sseMessageRecordsNotify = createSSEMessageRecordsNotify(rabbitMQChannel);

    router.post("/", auth, validate(postMessageSchema), async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        try {
            const roomId = parseInt(req.body.roomId as string);
            const type = req.body.type;
            const body = req.body.body;
            const localId = req.body.localId;
            const replyId = parseInt(req.body.replyId as string) || undefined;
            const fromUserId = userReq.user.id;
            const fromDeviceId = userReq.device.id;

            const roomUser = await prisma.roomUser.findFirst({
                where: { roomId, userId: fromUserId },
            });

            if (!roomUser) {
                return res.status(400).send(errorResponse("Room user not found", userReq.lang));
            }

            const room = await prisma.room.findUnique({
                where: { id: roomId },
                include: {
                    users: {
                        include: {
                            user: true,
                        },
                    },
                },
            });

            if (!room) {
                return res.status(400).send(errorResponse("Room not found", userReq.lang));
            }

            if (room.deleted) {
                return res.status(403).send(errorResponse("Room is deleted", userReq.lang));
            }

            const blocked = await isRoomBlocked(room.id, fromUserId);

            if (blocked) {
                return res.status(403).send(errorResponse("Room is blocked", userReq.lang));
            }

            // validation
            if (type === "image" || type === "audio" || type === "video" || type === "file") {
                if (!body.fileId)
                    return res.status(400).send(errorResponse("FileID is missing", userReq.lang));

                const fileId: number = body.fileId;
                const thumbId: number = body.thumbId;

                // check existence
                const exists = await prisma.file.findFirst({ where: { id: fileId } });
                if (!exists)
                    return res.status(400).send(errorResponse("Invalid fileId", userReq.lang));

                if (thumbId) {
                    const exists = await prisma.file.findFirst({
                        where: { id: thumbId },
                    });
                    if (!exists)
                        return res.status(400).send(errorResponse("Invalid thumbId", userReq.lang));
                }
            } else if (replyId) {
                const referenceMessage = await prisma.message.findUnique({
                    where: { id: replyId },
                });

                if (!referenceMessage) {
                    return res
                        .status(400)
                        .send(errorResponse("there is no message with replyId", userReq.lang));
                }

                if (!body.text) {
                    return res.status(400).send(errorResponse("Text is missing", userReq.lang));
                }

                const deviceMessage = await prisma.deviceMessage.findFirst({
                    where: { messageId: referenceMessage.id },
                });

                const formattedBody = await formatMessageBody(
                    deviceMessage.body,
                    referenceMessage.type
                );
                body.referenceMessage = sanitize({
                    ...referenceMessage,
                    body: formattedBody,
                }).message();
            } else if (type === "text") {
                if (!body.text)
                    return res.status(400).send(errorResponse("Text is missing", userReq.lang));
            } else {
                return res.status(400).send(errorResponse("Invalid type", userReq.lang));
            }

            const allReceivers = room.users.filter((u) => !u.user.isBot);

            const usersWhoBlockedSender =
                room.type === "private"
                    ? await prisma.block.findMany({
                          where: {
                              userId: { in: allReceivers.map((u) => u.userId) },
                              blockedId: fromUserId,
                          },
                          select: { userId: true },
                      })
                    : [];

            const receivers = allReceivers.filter(
                (u) => !usersWhoBlockedSender.map((u) => u.userId).includes(u.userId)
            );

            const devices = await prisma.device.findMany({
                where: {
                    userId: { in: receivers.map((u) => u.userId) },
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
                    totalUserCount: allReceivers.length,
                    deliveredCount: 0,
                    seenCount: 0,
                    localId,
                    replyId,
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

                        if (deviceMessage.deviceId === fromDeviceId) {
                            return;
                        }

                        if (deviceMessage.userId !== deviceMessage.fromUserId) {
                            rabbitMQChannel.sendToQueue(
                                Constants.QUEUE_PUSH,
                                Buffer.from(
                                    JSON.stringify({
                                        type: Constants.PUSH_TYPE_NEW_MESSAGE,
                                        token: devices.find((d) => d.id == deviceMessage.deviceId)
                                            ?.pushToken,
                                        data: {
                                            message: { ...sanitizedMessage },
                                            user: sanitize(userReq.user).user(),
                                            ...(room.type === "group" && { groupName: room.name }),
                                            toUserId: deviceMessage.userId,
                                        },
                                    })
                                )
                            );
                        }

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

            const messageRecordsNotifyData = {
                types: ["delivered", "seen"],
                userId: fromUserId,
                messageIds: [message.id],
                pushType: Constants.PUSH_TYPE_NEW_MESSAGE_RECORD,
            };

            sseMessageRecordsNotify(messageRecordsNotifyData);

            rabbitMQChannel.sendToQueue(
                Constants.QUEUE_WEBHOOK,
                Buffer.from(
                    JSON.stringify({
                        messageId: message.id,
                        body,
                    })
                )
            );

            handleNewMessage({
                room,
                users: room.users.map((u) => u.user),
                messageType: type,
                rabbitMQChannel,
            });
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
                            sanitize({ ...record, roomId: message.roomId }).messageRecord()
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
        const targetMessageId = +((req.query.targetMessageId as string) || "");
        const cursor = +((req.query.cursor as string) || "");
        const roomId = +((req.params.roomId as string) || "");

        let take = Constants.MESSAGE_PAGING_LIMIT;

        try {
            // find how many messages needs to reach to the target message
            if (targetMessageId) {
                const targetMessage = await prisma.message.findFirst({
                    where: {
                        id: targetMessageId,
                    },
                });

                if (targetMessage) {
                    const takeToTargetMessage = await prisma.message.count({
                        where: {
                            createdAt: { gte: targetMessage.createdAt },
                            roomId,
                        },
                    });

                    if (takeToTargetMessage > take) {
                        take = takeToTargetMessage;
                    }
                }
            }

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
                    createdAt: "desc",
                },
                ...(cursor && {
                    cursor: {
                        id: cursor,
                    },
                }),
                take: cursor ? take + 1 : take,
            });

            const messageRecordsNotifyData = {
                types: ["delivered"],
                userId,
                messageIds: messages.map((m) => m.id),
                pushType: Constants.PUSH_TYPE_NEW_MESSAGE_RECORD,
            };

            sseMessageRecordsNotify(messageRecordsNotifyData);

            const list = await Promise.all(
                messages.map(async (m) => {
                    const body = m.deviceMessages.find(
                        (dm) => dm.messageId === m.id && dm.deviceId === deviceId
                    )?.body;

                    const formattedBody = await formatMessageBody(body, m.type);
                    return sanitize({ ...m, body: formattedBody }).messageWithReactionRecords();
                })
            );

            const nextCursor = list.length && list.length >= take ? list[list.length - 1].id : null;

            res.send(
                successResponse(
                    {
                        list,
                        count,
                        limit: take,
                        nextCursor,
                    },
                    userReq.lang
                )
            );
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

                const messageRecordsNotifyData = {
                    types: ["delivered"],
                    userId,
                    messageIds: messages.map((m) => m.id),
                    pushType: Constants.PUSH_TYPE_NEW_MESSAGE_RECORD,
                };

                sseMessageRecordsNotify(messageRecordsNotifyData);

                res.send(successResponse({ messageRecords }, userReq.lang));
            } catch (e: any) {
                le(e);
                res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
            }
        }
    );

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

            const messages = await prisma.message.findMany({
                where: {
                    modifiedAt: { gt: new Date(lastUpdate) },
                    roomId: { in: roomsIds },
                },
                include: {
                    deviceMessages: true,
                },
            });

            const sanitizedMessages = await Promise.all(
                messages.map(async (message) =>
                    sanitize({
                        ...message,
                        body: await formatMessageBody(message.deviceMessages[0].body, message.type),
                    }).message()
                )
            );

            res.send(successResponse({ messages: sanitizedMessages }, userReq.lang));
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
                    deviceMessages: { some: { userId } },
                },
            });

            const messageRecords: Partial<
                Omit<MessageRecord, "createdAt" | "modifiedAt"> & {
                    createdAt: number;
                }
            >[] = [];

            const messageRecordsNotifyData = {
                types: ["seen", "delivered"],
                userId,
                messageIds: messages.map((m) => m.id),
                pushType: Constants.PUSH_TYPE_NEW_MESSAGE_RECORD,
            };

            sseMessageRecordsNotify(messageRecordsNotifyData);

            res.send(successResponse({ messageRecords }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.delete("/:id", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const userId = userReq.user.id;
        try {
            const id = parseInt((req.params.id as string) || "");
            const target = ((req.query.target as string) || "").toLowerCase();

            if (!target || !["all", "user"].includes(target)) {
                return res
                    .status(400)
                    .send(errorResponse("Invalid target query param", userReq.lang));
            }

            let message = await prisma.message.findFirst({
                where: { id },
                include: { deviceMessages: true },
            });
            if (!message) {
                return res.status(404).send(errorResponse("Not found", userReq.lang));
            }

            if (target === "all" && message.fromUserId !== userId) {
                return res
                    .status(403)
                    .send(errorResponse("User can't delete another users message", userReq.lang));
            }

            const roomUser = await prisma.roomUser.findFirst({ where: { roomId: message.roomId } });

            if (!roomUser) {
                return res
                    .status(403)
                    .send(
                        errorResponse(
                            "User can't delete messages from room that he is not in",
                            userReq.lang
                        )
                    );
            }

            const deviceMessagesToDelete =
                target === "all"
                    ? message.deviceMessages
                    : message.deviceMessages.filter((dm) => dm.userId === userId);

            const newBody = { text: "Deleted message" };

            for (const deviceMessage of deviceMessagesToDelete) {
                await prisma.deviceMessage.update({
                    where: { id: deviceMessage.id },
                    data: { modifiedAt: new Date(), body: newBody },
                });
            }

            if (target === "all") {
                message = await prisma.message.update({
                    where: { id },
                    data: { modifiedAt: new Date(), deleted: true, type: "text" },
                    include: { deviceMessages: true },
                });
            }

            const sanitizedMessage = sanitize({ ...message, body: newBody }).message();

            res.send(successResponse({ message: sanitizedMessage }, userReq.lang));

            while (deviceMessagesToDelete.length) {
                deviceMessagesToDelete.splice(0, 10).map((deviceMessage) => {
                    rabbitMQChannel.sendToQueue(
                        Constants.QUEUE_SSE,
                        Buffer.from(
                            JSON.stringify({
                                channelId: deviceMessage.deviceId,
                                data: {
                                    type: Constants.PUSH_TYPE_DELETE_MESSAGE,
                                    message: sanitizedMessage,
                                },
                            })
                        )
                    );
                });
            }
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.put("/:id", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const userId = userReq.user.id;

        try {
            const id = parseInt((req.params.id as string) || "");
            const text = req.body.text as string;

            if (!text) {
                return res.status(400).send(errorResponse("Text is required", userReq.lang));
            }

            let message = await prisma.message.findFirst({
                where: { id },
                include: { deviceMessages: true },
            });

            if (!message) {
                return res.status(404).send(errorResponse("Not found", userReq.lang));
            }

            if (userId !== message.fromUserId) {
                return res
                    .status(403)
                    .send(
                        errorResponse("User can't edit messages that he is not owner", userReq.lang)
                    );
            }

            if (message.type !== "text") {
                return res
                    .status(400)
                    .send(
                        errorResponse("Only messages with type text can be edited", userReq.lang)
                    );
            }

            const blocked = await isRoomBlocked(message.roomId, userReq.user.id);

            if (blocked) {
                return res.status(403).send(errorResponse("Room is blocked", userReq.lang));
            }

            for (const deviceMessage of message.deviceMessages) {
                await prisma.deviceMessage.update({
                    where: { id: deviceMessage.id },
                    data: {
                        modifiedAt: new Date(),
                        body: { ...(deviceMessage.body as Record<string, unknown>), text },
                    },
                });
            }

            message = await prisma.message.update({
                where: { id },
                data: { modifiedAt: new Date() },
                include: { deviceMessages: true },
            });

            const sanitizedMessage = sanitize({
                ...message,
                body: { ...(message.deviceMessages[0].body as Record<string, unknown>), text },
            }).message();

            res.send(successResponse({ message: sanitizedMessage }, userReq.lang));

            while (message.deviceMessages.length) {
                message.deviceMessages.splice(0, 10).map((deviceMessage) => {
                    rabbitMQChannel.sendToQueue(
                        Constants.QUEUE_SSE,
                        Buffer.from(
                            JSON.stringify({
                                channelId: deviceMessage.deviceId,
                                data: {
                                    type: Constants.PUSH_TYPE_UPDATE_MESSAGE,
                                    message: sanitizedMessage,
                                },
                            })
                        )
                    );
                });
            }
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    return router;
};
