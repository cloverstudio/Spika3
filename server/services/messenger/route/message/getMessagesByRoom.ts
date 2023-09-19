import { Request, Response, RequestHandler } from "express";

import { UserRequest } from "../../lib/types";
import { error as le } from "../../../../components/logger";

import auth from "../../lib/auth";
import { successResponse, errorResponse } from "../../../../components/response";
import * as Constants from "../../../../components/consts";

import { InitRouterParams } from "../../../types/serviceInterface";
import sanitize from "../../../../components/sanitize";
import { formatMessageBody } from "../../../../components/message";
import createSSEMessageRecordsNotify from "../../lib/sseMessageRecordsNotify";
import prisma from "../../../../components/prisma";
import { getRoomById } from "../room";

export default ({ rabbitMQChannel, redisClient }: InitRouterParams): RequestHandler[] => {
    const sseMessageRecordsNotify = createSSEMessageRecordsNotify(rabbitMQChannel);

    // only web should call this route
    return [
        auth,
        async (req: Request, res: Response) => {
            const userReq: UserRequest = req as UserRequest;
            const userId = userReq.user.id;
            const targetMessageId = +((req.query.targetMessageId as string) || "");
            const cursor = +((req.query.cursor as string) || "");
            const roomId = +((req.params.roomId as string) || "");

            let take = Constants.MESSAGE_PAGING_LIMIT;

            try {
                const room = await getRoomById(roomId, redisClient);

                if (!room) {
                    return res.status(404).send(errorResponse("No room found", userReq.lang));
                }

                const roomUser = room.users.find((u) => u.userId === userId);

                if (!roomUser) {
                    return res.status(404).send(errorResponse("No room found", userReq.lang));
                }

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
                        createdAt: {
                            gt: roomUser.createdAt,
                        },
                    },
                });

                const messages = await prisma.message.findMany({
                    where: {
                        roomId,
                        createdAt: {
                            gt: roomUser.createdAt,
                        },
                        deviceMessages: {
                            some: {},
                        },
                    },
                    include: {
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

                const list = await Promise.all(
                    messages.map(async (m) => {
                        const deviceMessage = await prisma.deviceMessage.findFirst({
                            where: {
                                messageId: m.id,
                                userId,
                            },
                        });

                        const { body, deleted, createdAt, modifiedAt } = deviceMessage || {};

                        const formattedBody = await formatMessageBody(body, m.type);
                        return sanitize({
                            ...m,
                            body: formattedBody,
                            deleted,
                            createdAt,
                            modifiedAt,
                        }).messageWithReactionRecords();
                    })
                );

                const nextCursor =
                    list.length && list.length >= take ? list[list.length - 1].id : null;

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

                const notDeliveredMessagesIds = messages
                    .filter(
                        (m) =>
                            !m.messageRecords.find(
                                (mr) => mr.type === "delivered" && mr.userId === userId
                            )
                    )
                    .map((m) => m.id);

                if (notDeliveredMessagesIds.length) {
                    const messageRecordsNotifyData = {
                        types: ["delivered"],
                        userId,
                        messageIds: notDeliveredMessagesIds,
                        pushType: Constants.PUSH_TYPE_NEW_MESSAGE_RECORD,
                    };

                    sseMessageRecordsNotify(messageRecordsNotifyData);
                }
            } catch (e: any) {
                le(e);
                res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
            }
        },
    ];
};
