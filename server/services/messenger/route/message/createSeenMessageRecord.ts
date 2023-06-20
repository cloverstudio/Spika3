import { Request, Response, RequestHandler } from "express";
import { MessageRecord } from "@prisma/client";

import { UserRequest } from "../../lib/types";
import { error as le } from "../../../../components/logger";

import auth from "../../lib/auth";
import { successResponse, errorResponse } from "../../../../components/response";
import * as Constants from "../../../../components/consts";

import { InitRouterParams } from "../../../types/serviceInterface";
import createSSEMessageRecordsNotify from "../../lib/sseMessageRecordsNotify";
import prisma from "../../../../components/prisma";

export default ({ rabbitMQChannel, redisClient }: InitRouterParams): RequestHandler[] => {
    const sseMessageRecordsNotify = createSSEMessageRecordsNotify(rabbitMQChannel);

    return [
        auth,
        async (req: Request, res: Response) => {
            const userReq: UserRequest = req as UserRequest;
            const userId = userReq.user.id;
            const roomId = parseInt(req.params.roomId as string);

            try {
                if (isNaN(roomId)) {
                    return res
                        .status(400)
                        .send(errorResponse("roomId must be number", userReq.lang));
                }

                const roomUser = await prisma.roomUser.findFirst({ where: { roomId, userId } });

                if (!roomUser) {
                    return res
                        .status(400)
                        .send(errorResponse("user is not in this room", userReq.lang));
                }

                const notSeenMessages = await prisma.message.findMany({
                    where: {
                        roomId,
                        createdAt: { gt: roomUser.createdAt },
                        messageRecords: { none: { userId, type: "seen" } },
                    },
                });

                const notDeliveredMessages = await prisma.message.findMany({
                    where: {
                        roomId,
                        createdAt: { gt: roomUser.createdAt },
                        messageRecords: { none: { userId, type: "seen" } },
                    },
                });

                const messageRecords: Partial<
                    Omit<MessageRecord, "createdAt" | "modifiedAt"> & {
                        createdAt: number;
                    }
                >[] = [];

                const messageRecordsNotifySeenData = {
                    types: ["seen"],
                    userId,
                    messageIds: notSeenMessages.map((m) => m.id),
                    pushType: Constants.PUSH_TYPE_NEW_MESSAGE_RECORD,
                };

                sseMessageRecordsNotify(messageRecordsNotifySeenData);

                const messageRecordsNotifyDeliveredData = {
                    types: ["delivered"],
                    userId,
                    messageIds: notDeliveredMessages.map((m) => m.id),
                    pushType: Constants.PUSH_TYPE_NEW_MESSAGE_RECORD,
                };

                sseMessageRecordsNotify(messageRecordsNotifyDeliveredData);

                const key = `${Constants.UNREAD_PREFIX}${roomId}_${userId}`;
                await redisClient.set(key, "0");

                res.send(successResponse({ messageRecords }, userReq.lang));

                const devices = await prisma.device.findMany({
                    where: {
                        userId,
                        id: { not: userReq.device.id },
                    },
                });

                for (const device of devices) {
                    rabbitMQChannel.sendToQueue(
                        Constants.QUEUE_SSE,
                        Buffer.from(
                            JSON.stringify({
                                channelId: device.id,
                                data: {
                                    type: Constants.PUSH_TYPE_SEEN_ROOM,
                                    roomId,
                                },
                            })
                        )
                    );
                }
            } catch (e: any) {
                le(e);
                res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
            }
        },
    ];
};
