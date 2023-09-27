import { Router, Request, Response } from "express";

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
import prisma from "../../../components/prisma";

const postMessageSchema = yup.object().shape({
    body: yup.object().shape({
        roomId: yup.number().strict().min(1).required(),
        type: yup.string().strict().required(),
        body: yup.object().required(),
        localId: yup.string().strict(),
        replyId: yup.number().strict(),
    }),
});

export default ({ rabbitMQChannel, redisClient }: InitRouterParams): Router => {
    const router = Router();

    router.post("/", auth, validate(postMessageSchema), async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        try {
            const roomId = parseInt(req.body.roomId as string);
            const type = req.body.type;
            const body = req.body.body;
            const localId = req.body.localId;
            const replyId = req.body.replyId;
            const fromUserId = userReq.user.id;

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
                return res.status(400).send(errorResponse("Chat not found", userReq.lang));
            }

            if (room.deleted) {
                return res.status(403).send(errorResponse("Room is deleted", userReq.lang));
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

            const devices = await prisma.device.findMany({
                where: {
                    userId: { in: room.users.map((u) => u.userId) },
                },
            });

            const deviceMessages = devices.map((device) => ({
                deviceId: device.id,
                userId: device.userId,
                fromUserId,
                body,
                action: MESSAGE_ACTION_NEW_MESSAGE,
            }));

            const message = await prisma.message.create({
                data: {
                    type,
                    roomId,
                    fromUserId: userReq.user.id,
                    totalUserCount: room.users.length,
                    deliveredCount: 0,
                    seenCount: 0,
                    localId,
                    replyId,
                },
            });

            const formattedBody = await formatMessageBody(body, type);
            const sanitizedMessage = sanitize({ ...message, body: formattedBody }).message();

            const key = `${Constants.LAST_MESSAGE_PREFIX}${roomId}`;
            await redisClient.set(key, sanitizedMessage.id.toString());

            res.send(successResponse({ message: sanitizedMessage }, userReq.lang));

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

            while (deviceMessages.length) {
                await Promise.all(
                    deviceMessages.splice(0, 10).map(async (deviceMessage) => {
                        await prisma.deviceMessage.create({
                            data: { ...deviceMessage, messageId: message.id },
                        });

                        const roomAvatarFileId = getRoomAvatarFileId(room, deviceMessage.userId);

                        rabbitMQChannel.sendToQueue(
                            Constants.QUEUE_PUSH,
                            Buffer.from(
                                JSON.stringify({
                                    type: Constants.PUSH_TYPE_NEW_MESSAGE,
                                    token: devices.find((d) => d.id == deviceMessage.deviceId)
                                        ?.pushToken,
                                    data: {
                                        message: sanitizedMessage,
                                        user: sanitize(userReq.user).user(),
                                        ...(room.type === "group" && { groupName: room.name }),
                                        toUserId: deviceMessage.userId,
                                        roomUserCreatedAt: roomUser.createdAt,
                                        roomAvatarFileId,
                                    },
                                }),
                            ),
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
                                }),
                            ),
                        );
                    }),
                );
            }

            rabbitMQChannel.sendToQueue(
                Constants.QUEUE_WEBHOOK,
                Buffer.from(
                    JSON.stringify({
                        messageId: message.id,
                        body,
                    }),
                ),
            );
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    return router;
};
