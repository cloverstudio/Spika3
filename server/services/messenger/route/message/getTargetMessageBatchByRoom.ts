import { Request, Response, RequestHandler } from "express";
import { UserRequest } from "../../lib/types";
import { error as le } from "../../../../components/logger";
import auth from "../../lib/auth";
import { successResponse, errorResponse } from "../../../../components/response";
import * as Constants from "../../../../components/consts";
import { InitRouterParams } from "../../../types/serviceInterface";
import sanitize from "../../../../components/sanitize";
import { formatMessageBody } from "../../../../components/message";
import prisma from "../../../../components/prisma";
import { getRoomById } from "../room";

export default ({ redisClient }: InitRouterParams): RequestHandler[] => {
    // only web should call this route
    return [
        auth,
        async (req: Request, res: Response) => {
            const userReq: UserRequest = req as UserRequest;
            const userId = userReq.user.id;
            const targetMessageId = +((req.query.targetMessageId as string) || "");
            const cursorUp = req.query.cursorUp ? +((req.query.cursorUp as string) || "") : null;
            const cursorDown = req.query.cursorDown
                ? +((req.query.cursorDown as string) || "")
                : null;
            const roomId = +((req.params.roomId as string) || "");

            let take = Constants.MESSAGE_PAGING_LIMIT;
            const firstBatchUpTake = 25;
            const firstBatchDownTake = 25;

            if (!cursorUp && !cursorDown && !targetMessageId) {
                return res.status(400).send(errorResponse("Invalid parameters", userReq.lang));
            }

            const messages = [];
            let nextCursorDown = null;
            let nextCursorUp = null;
            let hasMoreOlderMessages = false;
            let hasMoreNewerMessages = false;

            try {
                const room = await getRoomById(roomId, redisClient);

                if (!room) {
                    return res.status(404).send(errorResponse("No room found", userReq.lang));
                }

                const roomUser = room.users.find((u) => u.userId === userId);

                if (!roomUser) {
                    return res.status(404).send(errorResponse("No room found", userReq.lang));
                }

                if (targetMessageId) {
                    const targetMessage = await prisma.message.findFirst({
                        where: {
                            id: targetMessageId,
                        },

                        include: {
                            messageRecords: { orderBy: { modifiedAt: "desc" } },
                        },
                    });

                    if (!targetMessage) {
                        return res
                            .status(404)
                            .send(errorResponse("Target message not found", userReq.lang));
                    }

                    if (!cursorUp && !cursorDown) {
                        const newerMessages = await prisma.message.findMany({
                            where: {
                                roomId,
                                createdAt: {
                                    gt: roomUser.createdAt,
                                },
                                id: {
                                    gt: targetMessageId,
                                },
                                deviceMessages: {
                                    some: {},
                                },
                            },
                            include: {
                                messageRecords: { orderBy: { modifiedAt: "desc" } },
                            },
                            orderBy: {
                                id: "asc",
                            },
                            take: firstBatchUpTake,
                        });

                        const olderMessages = await prisma.message.findMany({
                            where: {
                                roomId,
                                createdAt: {
                                    gt: roomUser.createdAt,
                                },
                                id: {
                                    lte: targetMessageId,
                                },
                                deviceMessages: {
                                    some: {},
                                },
                            },
                            include: {
                                messageRecords: { orderBy: { modifiedAt: "desc" } },
                            },
                            orderBy: {
                                id: "desc",
                            },
                            take: firstBatchDownTake,
                        });

                        const reversedNewerMessages = newerMessages.reverse();

                        messages.push(...reversedNewerMessages, targetMessage, ...olderMessages);

                        nextCursorDown = messages.length ? messages[0].id : null;
                        nextCursorUp = messages.length ? messages[messages.length - 1].id : null;

                        hasMoreOlderMessages = olderMessages.length === firstBatchDownTake;
                        hasMoreNewerMessages = newerMessages.length === firstBatchUpTake;
                    }
                }

                if (cursorUp) {
                    const olderMessages = await prisma.message.findMany({
                        where: {
                            roomId,
                            createdAt: {
                                gt: roomUser.createdAt,
                            },
                            id: {
                                lt: cursorUp,
                            },
                            deviceMessages: {
                                some: {},
                            },
                        },
                        include: {
                            messageRecords: { orderBy: { modifiedAt: "desc" } },
                        },
                        orderBy: {
                            id: "desc",
                        },
                        take: take,
                    });

                    messages.push(...olderMessages);

                    nextCursorUp = messages.length ? messages[messages.length - 1].id : null;
                    hasMoreOlderMessages = olderMessages.length === take;
                }

                if (cursorDown) {
                    const newerMessages = await prisma.message.findMany({
                        where: {
                            roomId,
                            createdAt: {
                                gt: roomUser.createdAt,
                            },
                            id: {
                                gt: cursorDown,
                            },
                            deviceMessages: {
                                some: {},
                            },
                        },
                        include: {
                            messageRecords: { orderBy: { modifiedAt: "desc" } },
                        },
                        orderBy: {
                            id: "asc",
                        },
                        take: take,
                    });

                    messages.push(...newerMessages);

                    nextCursorDown = messages.length ? messages[messages.length - 1].id : null;
                    hasMoreNewerMessages = newerMessages.length === take;
                }

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
                    }),
                );

                res.send(
                    successResponse(
                        {
                            list,
                            nextCursorUp,
                            nextCursorDown,
                            hasMoreOlderMessages,
                            hasMoreNewerMessages,
                        },
                        userReq.lang,
                    ),
                );
            } catch (e: any) {
                le(e);
                res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
            }
        },
    ];
};
