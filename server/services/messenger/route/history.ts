import { Router, Request, Response } from "express";

import l, { error as le } from "../../../components/logger";
import { successResponse, errorResponse } from "../../../components/response";
import auth from "../lib/auth";
import { UserRequest } from "../lib/types";
import sanitize from "../../../components/sanitize";
import * as Constants from "../../../components/consts";
import prisma from "../../../components/prisma";
import { getRoomById, getRoomUnreadCount, isRoomMuted, isRoomPinned } from "./room";
import { InitRouterParams } from "../../types/serviceInterface";
import { Message } from "@prisma/client";

export default ({ redisClient }: InitRouterParams): Router => {
    const router = Router();

    router.get("/", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const userId = userReq.user.id;
        const page = parseInt(req.query.page ? (req.query.page as string) : "") || 1;
        const keyword = req.query.keyword as string;
        try {
            let roomUsers = await prisma.roomUser.findMany({
                where: {
                    room: {
                        ...(keyword
                            ? {
                                  OR: ["startsWith", "contains"].map((key) => ({
                                      name: {
                                          [key]: keyword,
                                      },
                                  })),
                                  AND: {
                                      type: "group",
                                      deleted: false,
                                  },
                              }
                            : {
                                  deleted: false,
                              }),
                    },
                    userId,
                },
            });

            // find a display name of user who are in private room
            if (keyword?.length > 0) {
                const privateRooms = await prisma.roomUser.findMany({
                    where: {
                        room: {
                            type: "private",
                        },
                        userId,
                    },
                    include: { room: true },
                });
                const privateRoomIds = privateRooms.map((r) => r.room.id);

                const matchedRoomUsers = await prisma.roomUser.findMany({
                    where: {
                        OR: ["startsWith", "contains"].map((key) => ({
                            user: {
                                displayName: {
                                    [key]: keyword,
                                },
                            },
                        })),
                        AND: {
                            roomId: { in: privateRoomIds },
                            userId: {
                                not: userId,
                            },
                        },
                    },
                });

                roomUsers = [...roomUsers, ...matchedRoomUsers];
            }

            const allRoomsIds = roomUsers.map((r) => r.roomId);

            const allRooms = await prisma.room.findMany({
                where: {
                    id: { in: allRoomsIds },
                },
                include: {
                    users: true,
                },
            });

            const roomsIds = allRooms
                .filter((r) => r.type === "group" || r.users.length === 2)
                .map((r) => r.id);

            const count = await prisma.room.count({
                where: {
                    id: { in: roomsIds },
                    messages: {
                        some: {},
                    },
                    ...(keyword && {
                        name: {
                            startsWith: keyword,
                        },
                    }),
                },
            });

            const messagesIds = await Promise.all(
                roomsIds.map(async (roomId) => {
                    const key = `${Constants.LAST_MESSAGE_PREFIX}${roomId}`;
                    const lastMessageId = await redisClient.get(key);

                    if (lastMessageId) {
                        return +lastMessageId;
                    }

                    const roomUser = roomUsers.find((ru) => ru.roomId === roomId);

                    if (!roomUser) {
                        return null;
                    }

                    const lastMessage = await prisma.message.findFirst({
                        where: {
                            roomId,
                        },
                        orderBy: {
                            createdAt: "desc",
                        },
                    });

                    if (!lastMessage) {
                        return null;
                    }

                    await redisClient.set(key, lastMessage.id.toString());

                    if (+lastMessage.modifiedAt <= +roomUser.createdAt) {
                        return null;
                    }

                    return lastMessage.id;
                }),
            );

            const messages = await prisma.message.findMany({
                where: {
                    id: { in: messagesIds.filter(Boolean) },
                },
                orderBy: {
                    createdAt: "desc",
                },
                skip: Constants.HISTORY_PAGING_LIMIT * (page - 1),
                take: Constants.HISTORY_PAGING_LIMIT,
            });

            const deviceMessages = await prisma.deviceMessage.findMany({
                where: { userId, messageId: { in: messages.map((m) => m.id) } },
                select: {
                    messageId: true,
                    body: true,
                    deleted: true,
                },
            });

            const list = await Promise.all(
                messages.map(async (m) => {
                    const muted = await isRoomMuted({ userId, roomId: m.roomId, redisClient });
                    const pinned = await isRoomPinned({ userId, roomId: m.roomId, redisClient });
                    const dm = deviceMessages.find((dm) => dm.messageId === m.id);
                    const { body, deleted } = dm || {};
                    const roomUser = roomUsers.find((ru) => ru.roomId === m.roomId);

                    const unreadCount = await getRoomUnreadCount({
                        userId,
                        roomId: m.roomId,
                        redisClient,
                        roomUserCreatedAt: roomUser?.createdAt,
                    });

                    return {
                        roomId: m.roomId,
                        muted,
                        pinned,
                        lastMessage: dm
                            ? sanitize({
                                  ...m,
                                  ...(body && { body }),
                                  deleted,
                              }).message()
                            : null,
                        unreadCount: +unreadCount,
                    };
                }),
            );

            res.send(
                successResponse({
                    list,
                    count,
                    limit: Constants.PAGING_LIMIT,
                    page,
                }),
            );
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.get("/roomId/:roomId", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const userId = userReq.user.id;
        const deviceId = userReq.device.id;
        const roomId = parseInt(req.params.roomId as string);

        if (!roomId) {
            res.status(400).send(errorResponse("Room id is required", userReq.lang));
            return;
        }

        try {
            const room = await getRoomById(roomId, redisClient);

            if (!room) {
                res.status(404).send(errorResponse("Chat not found", userReq.lang));
                return;
            }

            const roomUser = room.users.find((ru) => ru.userId === userId);

            if (!roomUser) {
                res.status(404).send(errorResponse("Chat not found", userReq.lang));
                return;
            }

            const lastMessageKey = `${Constants.LAST_MESSAGE_PREFIX}${roomId}`;
            const lastMessageIdString = await redisClient.get(lastMessageKey);
            let lastMessageId: number;
            let lastMessage: Message;

            if (lastMessageIdString) {
                lastMessageId = +lastMessageIdString;
                lastMessage = await prisma.message.findFirst({
                    where: {
                        id: lastMessageId,
                    },
                });
            } else {
                lastMessage = await prisma.message.findFirst({
                    where: {
                        roomId,
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                });

                if (lastMessage) {
                    await redisClient.set(lastMessageKey, lastMessage.id.toString());
                }
            }

            const unreadCountKey = `${Constants.UNREAD_PREFIX}${roomId}_${userId}`;
            let unreadCount = await redisClient.get(unreadCountKey);

            if (!unreadCount) {
                const unreadMessages = await prisma.message.findMany({
                    where: {
                        roomId,
                        createdAt: {
                            gt: roomUser.createdAt,
                        },
                        messageRecords: {
                            none: {
                                userId: userId,
                                type: "seen",
                            },
                        },
                        NOT: {
                            fromUserId: userId,
                        },
                    },
                });
                unreadCount = unreadMessages.length.toString();
                redisClient.set(unreadCountKey, unreadCount);
            }

            const muted = await isRoomMuted({ userId, roomId, redisClient });
            const pinned = await isRoomPinned({ userId, roomId, redisClient });

            let lastMessageSanitized: any;
            if (lastMessage) {
                const deviceMessage = await prisma.deviceMessage.findFirst({
                    where: {
                        userId,
                        deviceId,
                        messageId: lastMessage.id,
                    },
                    select: {
                        body: true,
                        deleted: true,
                    },
                });
                if (deviceMessage) {
                    const { body, deleted } = deviceMessage;
                    lastMessageSanitized = sanitize({
                        ...lastMessage,
                        ...(body && { body }),
                        deleted,
                    }).message();
                }
            }

            res.send(
                successResponse({
                    unreadCount: +unreadCount,
                    roomId,
                    lastMessage: lastMessageSanitized ? lastMessageSanitized : null,
                    muted,
                    pinned,
                }),
            );
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    return router;
};
