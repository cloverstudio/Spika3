import { Router, Request, Response } from "express";

import l, { error as le } from "../../../components/logger";
import { successResponse, errorResponse } from "../../../components/response";
import auth from "../lib/auth";
import { UserRequest } from "../lib/types";
import sanitize from "../../../components/sanitize";
import * as Constants from "../../../components/consts";
import prisma from "../../../components/prisma";
import { isRoomMuted, isRoomPinned } from "./room";
import { InitRouterParams } from "../../types/serviceInterface";
import utils from "../../../components/utils";

export default ({ redisClient }: InitRouterParams): Router => {
    const router = Router();

    router.get("/", auth, async (req: Request, res: Response) => {
        const start = process.hrtime();

        const userReq: UserRequest = req as UserRequest;
        const userId = userReq.user.id;
        const deviceId = userReq.device.id;
        const page = parseInt(req.query.page ? (req.query.page as string) : "") || 1;
        const keyword = req.query.keyword as string;
        try {
            let roomUsers = await prisma.roomUser.findMany({
                where: {
                    room: {
                        name: {
                            startsWith: keyword,
                        },
                        deleted: false,
                    },
                    userId,
                },

                include: { room: true, user: true },
            });

            l(`[GET ROOM USERS] ${utils.getDurationInMilliseconds(start).toLocaleString()} ms`);

            // find a display name of user who are in private room
            if (keyword?.length > 0) {
                const findDisplayName = process.hrtime();
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
                        roomId: { in: privateRoomIds },
                        user: {
                            displayName: {
                                startsWith: keyword,
                            },
                        },
                        userId: {
                            not: userId,
                        },
                    },

                    include: { room: true, user: true },
                });

                roomUsers = [...roomUsers, ...matchedRoomUsers];

                l(
                    `[FIND BY DISPLAY NAMES] ${utils
                        .getDurationInMilliseconds(findDisplayName)
                        .toLocaleString()} ms`
                );
            }

            const findPinnedRooms = process.hrtime();

            const roomsIds = roomUsers.map((r) => r.room.id);

            const userSettings = await prisma.userSetting.findMany({
                where: {
                    userId,
                    key: { startsWith: Constants.ROOM_PIN_PREFIX },
                    value: "true",
                },
            });

            roomsIds.push(...userSettings.map((u) => +u.key.split("_")[1]));
            l(
                `[FIND A PINNED ROOMS] ${utils
                    .getDurationInMilliseconds(findPinnedRooms)
                    .toLocaleString()} ms`
            );

            const findCount = process.hrtime();

            const count = await prisma.room.count({
                where: {
                    id: { in: roomsIds },
                    messages: {
                        some: {},
                    },
                    name: {
                        startsWith: keyword,
                    },
                },
            });
            l(`[FIND COUNT] ${utils.getDurationInMilliseconds(findCount).toLocaleString()} ms`);

            const findUnreadMessages = process.hrtime();

            const unreadMessages = await prisma.message.findMany({
                where: {
                    roomId: { in: roomsIds },
                    deviceMessages: {
                        some: {
                            deviceId,
                        },
                    },
                    messageRecords: {
                        none: {
                            userId,
                            type: "seen",
                        },
                    },
                    NOT: {
                        fromUserId: userId,
                    },
                },
            });

            l(
                `[FIND UNREAD MESSAGES] ${utils
                    .getDurationInMilliseconds(findUnreadMessages)
                    .toLocaleString()} ms`
            );

            const findMessages = process.hrtime();

            const messages = await prisma.message.findMany({
                where: {
                    roomId: { in: roomsIds },
                },
                distinct: ["roomId"],
                orderBy: {
                    createdAt: "desc",
                },
                skip: Constants.PAGING_LIMIT * (page - 1),
                take: Constants.PAGING_LIMIT,
                include: {
                    room: {
                        include: {
                            users: {
                                include: { user: true },
                            },
                        },
                    },
                },
            });
            l(
                `[FIND MESSAGES] ${utils
                    .getDurationInMilliseconds(findMessages)
                    .toLocaleString()} ms`
            );

            const findDM = process.hrtime();

            const deviceMessages = await prisma.deviceMessage.findMany({
                where: { userId, deviceId, messageId: { in: messages.map((m) => m.id) } },
                select: {
                    messageId: true,
                    body: true,
                    deleted: true,
                },
            });
            l(
                `[FIND DEVICE MESSAGES] ${utils
                    .getDurationInMilliseconds(findDM)
                    .toLocaleString()} ms`
            );

            const formatList = process.hrtime();

            const list = await Promise.all(
                messages.map(async (m) => {
                    const { room, ...message } = m;
                    const muted = await isRoomMuted({ userId, roomId: room.id, redisClient });
                    const pinned = await isRoomPinned({ userId, roomId: room.id, redisClient });
                    const dm = deviceMessages.find((dm) => dm.messageId === m.id);
                    const { body, deleted } = dm || {};
                    const unreadCount = unreadMessages.filter(
                        (mc) => mc.roomId === m.roomId
                    ).length;
                    return {
                        ...sanitize({ ...room, muted, pinned }).room(),
                        lastMessage: sanitize({
                            ...message,
                            ...(body && { body }),
                            deleted,
                        }).message(),
                        unreadCount,
                    };
                })
            );
            l(`[FORMAT LIST] ${utils.getDurationInMilliseconds(formatList).toLocaleString()} ms`);

            res.send(
                successResponse({
                    list,
                    count,
                    limit: Constants.PAGING_LIMIT,
                })
            );
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    return router;
};
