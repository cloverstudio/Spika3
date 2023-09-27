import { Request, Response, RequestHandler } from "express";
import dayjs from "dayjs";

import { UserRequest } from "../../lib/types";
import { error as le } from "../../../../components/logger";

import auth from "../../lib/auth";
import * as yup from "yup";
import validate from "../../../../components/validateMiddleware";
import { successResponse, errorResponse } from "../../../../components/response";
import { MESSAGE_ACTION_NEW_MESSAGE } from "../../../../components/consts";
import * as Constants from "../../../../components/consts";

import { InitRouterParams } from "../../../types/serviceInterface";
import sanitize from "../../../../components/sanitize";
import { formatMessageBody } from "../../../../components/message";
import createSSEMessageRecordsNotify from "../../lib/sseMessageRecordsNotify";
import prisma from "../../../../components/prisma";
import { handleNewMessage } from "../../../../components/agent";
import { getRoomById, getRoomUnreadCount } from "../room";
import { isRoomBlocked } from "../block";

const postMessageSchema = yup.object().shape({
    body: yup.object().shape({
        roomId: yup.number().strict().min(1).required(),
        type: yup.string().strict().required(),
        body: yup.object().required(),
        localId: yup.string().strict(),
        replyId: yup.number().strict(),
    }),
});

export default ({ rabbitMQChannel, redisClient }: InitRouterParams): RequestHandler[] => {
    const sseMessageRecordsNotify = createSSEMessageRecordsNotify(rabbitMQChannel);

    return [
        auth,
        validate(postMessageSchema),
        async (req: Request, res: Response) => {
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
                    return res.status(400).send(errorResponse("Chat user not found", userReq.lang));
                }

                const room = await getRoomById(roomId, redisClient);

                if (!room) {
                    return res.status(400).send(errorResponse("Chat not found", userReq.lang));
                }

                if (room.deleted) {
                    return res.status(403).send(errorResponse("Chat is deleted", userReq.lang));
                }

                const blocked = await isRoomBlocked(room.id, fromUserId);

                if (blocked) {
                    return res.status(403).send(errorResponse("Chat is blocked", userReq.lang));
                }

                if (type === "image" || type === "audio" || type === "video" || type === "file") {
                    if (!body.fileId) {
                        return res
                            .status(400)
                            .send(errorResponse("fileId is missing", userReq.lang));
                    }

                    const fileId: number = body.fileId;
                    const thumbId: number = body.thumbId;

                    const exists = await prisma.file.findFirst({ where: { id: fileId } });
                    if (!exists)
                        return res.status(400).send(errorResponse("Invalid fileId", userReq.lang));

                    if (thumbId) {
                        const exists = await prisma.file.findFirst({
                            where: { id: thumbId },
                        });
                        if (!exists) {
                            return res
                                .status(400)
                                .send(errorResponse("Invalid thumbId", userReq.lang));
                        }
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
                        referenceMessage.type,
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
                    (u) => !usersWhoBlockedSender.map((u) => u.userId).includes(u.userId),
                );

                const devices = await prisma.device.findMany({
                    where: {
                        userId: { in: receivers.map((u) => u.userId) },
                    },
                });

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

                await prisma.deviceMessage.createMany({
                    data: devices.map((device) => ({
                        deviceId: device.id,
                        userId: device.userId,
                        fromUserId,
                        fromDeviceId,
                        body,
                        action: MESSAGE_ACTION_NEW_MESSAGE,
                        messageId: message.id,
                    })),
                });

                const userDeviceMessage = await prisma.deviceMessage.findFirst({
                    where: {
                        userId: fromUserId,
                        messageId: message.id,
                        deviceId: fromDeviceId,
                    },
                });

                const formattedBody = await formatMessageBody(body, type);
                const sanitizedMessage = sanitize({
                    ...message,
                    body: formattedBody,
                    createdAt: userDeviceMessage.createdAt,
                    modifiedAt: userDeviceMessage.modifiedAt,
                }).message();

                await Promise.all(
                    receivers.map(async ({ userId, createdAt }) => {
                        await getRoomUnreadCount({
                            roomId,
                            userId,
                            redisClient,
                            roomUserCreatedAt: createdAt,
                        });

                        const key = `${Constants.UNREAD_PREFIX}${roomId}_${userId}`;
                        if (userId !== fromUserId) {
                            await redisClient.incr(key);
                        }
                    }),
                );

                const key = `${Constants.LAST_MESSAGE_PREFIX}${roomId}`;
                await redisClient.set(key, sanitizedMessage.id.toString());

                function getRoomAvatarFileId(room: any, userId: number) {
                    if (room.type === "group") {
                        return room.avatarFileId;
                    }
                    const otherUser = room.users.find((u: any) => u.userId !== userId);

                    if (!otherUser) {
                        return 0;
                    }

                    return otherUser.user.avatarFileId;
                }

                while (devices.length) {
                    await Promise.all(
                        devices.splice(0, 10).map(async (device) => {
                            if (!device) {
                                return;
                            }

                            if (device.id === fromDeviceId) {
                                return;
                            }

                            const checkIfShouldSendPush = () => {
                                const tokenExpiredAtTS = +dayjs(device.tokenExpiredAt);
                                const now = +dayjs();

                                if (now > tokenExpiredAtTS) {
                                    return false;
                                }

                                if (
                                    message.fromUserId === device.userId &&
                                    device.osName === "android"
                                ) {
                                    return true;
                                }

                                if (message.fromUserId === device.userId) {
                                    return false;
                                }

                                return true;
                            };

                            if (checkIfShouldSendPush()) {
                                const roomAvatarFileId = getRoomAvatarFileId(room, device.userId);

                                rabbitMQChannel.sendToQueue(
                                    Constants.QUEUE_PUSH,
                                    Buffer.from(
                                        JSON.stringify({
                                            type: Constants.PUSH_TYPE_NEW_MESSAGE,
                                            token: device.pushToken,
                                            data: {
                                                message: { ...sanitizedMessage },
                                                user: sanitize(userReq.user).user(),
                                                ...(room.type === "group" && {
                                                    groupName: room.name,
                                                }),
                                                toUserId: device.userId,
                                                roomUserCreatedAt: roomUser.createdAt,
                                                roomAvatarFileId,
                                            },
                                        }),
                                    ),
                                );
                            }

                            rabbitMQChannel.sendToQueue(
                                Constants.QUEUE_SSE,
                                Buffer.from(
                                    JSON.stringify({
                                        channelId: device.id,
                                        data: {
                                            type: Constants.PUSH_TYPE_NEW_MESSAGE,
                                            message: sanitizedMessage,
                                        },
                                    }),
                                ),
                            );
                        }),
                    );
                }

                res.send(successResponse({ message: sanitizedMessage }, userReq.lang));

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
                        }),
                    ),
                );

                handleNewMessage({
                    body,
                    fromUserId,
                    room,
                    users: room.users.map((u) => u.user),
                    messageType: type,
                    rabbitMQChannel,
                });
            } catch (e: any) {
                le(e);
                res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
            }
        },
    ];
};
