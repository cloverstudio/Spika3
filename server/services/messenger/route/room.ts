import { Router, Request, Response } from "express";
import { RoomUser, Room, User } from "@prisma/client";

import { UserRequest } from "../lib/types";
import { error as le } from "../../../components/logger";

import auth from "../lib/auth";
import * as yup from "yup";
import validate from "../../../components/validateMiddleware";
import { successResponse, errorResponse } from "../../../components/response";
import * as Constants from "../../../components/consts";
import sanitize from "../../../components/sanitize";
import { InitRouterParams } from "../../types/serviceInterface";
import createSSERoomsNotify from "../lib/sseRoomsNotify";
import prisma from "../../../components/prisma";
import { createClient } from "redis";
import { handleNewRoom } from "../../../components/chatGPT";

const postRoomSchema = yup.object().shape({
    body: yup.object().shape({
        name: yup.string().default(""),
        avatarFileId: yup.number().default(0),
        type: yup.string().strict(),
        userIds: yup.array().default([]).of(yup.number().strict().moreThan(0)),
        adminUserIds: yup.array().default([]).of(yup.number().strict().moreThan(0)),
    }),
});

const patchRoomSchema = yup.object().shape({
    body: yup.object().shape({
        name: yup.string().strict(),
        avatarFileId: yup.number().strict(),
        type: yup.string().strict(),
        userIds: yup.array().of(yup.number().moreThan(0)).strict(),
        adminUserIds: yup.array().of(yup.number().moreThan(0)).strict(),
    }),
});

const leaveRoomSchema = yup.object().shape({
    body: yup.object().shape({
        adminUserIds: yup.array().of(yup.number().moreThan(0)).strict(),
    }),
});

export default ({ rabbitMQChannel, redisClient }: InitRouterParams): Router => {
    const router = Router();
    const sseRoomsNotify = createSSERoomsNotify(rabbitMQChannel);

    router.post("/", auth, validate(postRoomSchema), async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        try {
            const {
                avatarFileId,
                type: userDefinedType,
                userIds,
                adminUserIds,
                name: userDefinedName,
            } = req.body;

            if (!adminUserIds.includes(userReq.user.id)) {
                adminUserIds.push(userReq.user.id);
            }

            if (!userIds.includes(userReq.user.id)) {
                userIds.push(userReq.user.id);
            }

            const foundUsers = await prisma.user.findMany({
                where: { id: { in: [...userIds, ...adminUserIds] } },
            });

            const notAddedUsers = userIds.filter(
                (id: number) => !foundUsers.map((fu) => fu.id).includes(id)
            );

            if (notAddedUsers.length) {
                return res
                    .status(400)
                    .send(
                        errorResponse(
                            `Users doesn't exist, ids: ${notAddedUsers.join(",")}`,
                            userReq.lang
                        )
                    );
            }

            const notAddedAdminUsers = adminUserIds.filter(
                (id: number) => !foundUsers.map((fu) => fu.id).includes(id)
            );

            if (notAddedAdminUsers.length) {
                return res
                    .status(400)
                    .send(
                        errorResponse(
                            `Admin users doesn't exist, ids: ${notAddedAdminUsers.join(",")}`,
                            userReq.lang
                        )
                    );
            }

            const users = foundUsers.map((user) => ({
                userId: user.id,
                isAdmin: adminUserIds.includes(user.id) || false,
            }));

            const type = userDefinedType || (users.length < 3 ? "private" : "group");
            const name = getRoomName(userDefinedName, users.length);

            if (users.length === 2 && type === "private") {
                const userIdsStr: string = users.map((u) => u.userId).join(",");
                const query = `
                    select * from room 
                        where type = 'private' 
                        and deleted = false 
                        and id in ( 
                            select room_id from room_user where user_id in 
                                (
                                    ${userIdsStr}
                                ) group by room_id having count(*) > 1 
                        )`;

                const existingRoomResult: Room[] = await prisma.$queryRawUnsafe<Room[]>(query);

                if (existingRoomResult.length > 0) {
                    return res.status(409).send(errorResponse("Room already exists", userReq.lang));
                }
            }

            const room = await prisma.room.create({
                data: {
                    name,
                    type,
                    avatarFileId: parseInt(avatarFileId || "0"),
                    users: {
                        create: users,
                    },
                },
                include: {
                    users: {
                        include: {
                            user: true,
                        },
                    },
                },
            });

            const key = `${Constants.ROOM_PREFIX}${room.id}`;
            await redisClient.set(key, JSON.stringify(room));

            const sanitizedRoom = sanitize({ ...room, muted: false, pinned: false }).room();

            res.send(
                successResponse(
                    {
                        room: sanitizedRoom,
                    },
                    userReq.lang
                )
            );

            sseRoomsNotify(sanitizedRoom, Constants.PUSH_TYPE_NEW_ROOM);
            handleNewRoom({ users: foundUsers, room, rabbitMQChannel });
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.put("/:id", auth, validate(patchRoomSchema), async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        try {
            const id = parseInt((req.params.id as string) || "");
            const { userIds, adminUserIds, name, avatarFileId } = req.body;

            const room = await prisma.room.findFirst({
                where: { id, deleted: false },
                include: { users: true },
            });

            if (!room) {
                return res.status(404).send(errorResponse("Not found", userReq.lang));
            }

            if (room.type === "private") {
                return res
                    .status(403)
                    .send(errorResponse("Can't update private room", userReq.lang));
            }

            const userIsAdmin = isAdminCheck(userReq.user.id, room.users);
            if (!userIsAdmin) {
                return res.status(403).send(errorResponse("Forbidden", userReq.lang));
            }

            const shouldUpdateUsers = typeof userIds !== "undefined";
            const shouldUpdateAdminUsers = typeof adminUserIds !== "undefined";

            if (shouldUpdateUsers) {
                await updateRoomUsers({ newIds: userIds, room });
            }

            if (shouldUpdateAdminUsers) {
                if (!adminUserIds.includes(userReq.user.id)) {
                    adminUserIds.push(userReq.user.id);
                }

                await updateRoomAdminUsers({ room, newAdminIds: adminUserIds });
            }

            const userCount = await prisma.roomUser.count({ where: { roomId: id } });

            const update: Partial<Room> = {
                modifiedAt: new Date(),
                ...(name && { name }),
                ...((avatarFileId || avatarFileId === 0) && {
                    avatarFileId: parseInt(avatarFileId),
                }),
                ...(userCount > 2 && { type: "group" }),
            };

            const updated = await prisma.room.update({
                where: { id },
                data: update,
                include: {
                    users: {
                        include: {
                            user: true,
                        },
                    },
                },
            });

            const key = `${Constants.ROOM_PREFIX}${id}`;
            await redisClient.set(key, JSON.stringify(updated));

            const muted = await isRoomMuted({ roomId: id, userId: userReq.user.id, redisClient });
            const pinned = await isRoomPinned({ roomId: id, userId: userReq.user.id, redisClient });

            const sanitizedRoom = sanitize({ ...updated, muted, pinned }).room();
            sseRoomsNotify(sanitizedRoom, Constants.PUSH_TYPE_UPDATE_ROOM);

            res.send(successResponse({ room: sanitizedRoom }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.delete("/:id", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        try {
            const id = parseInt((req.params.id as string) || "");

            const room = await prisma.room.findFirst({ where: { id }, include: { users: true } });

            if (!room) {
                return res.status(404).send(errorResponse("Not found", userReq.lang));
            }

            if (room.type === "private") {
                return res
                    .status(403)
                    .send(errorResponse("Can't delete private room", userReq.lang));
            }

            const userIsAdmin = isAdminCheck(userReq.user.id, room.users);
            if (!userIsAdmin) {
                return res.status(403).send(errorResponse("Forbidden", userReq.lang));
            }

            const updated = await prisma.room.update({
                where: { id },
                data: { deleted: true, modifiedAt: new Date() },
                include: {
                    users: {
                        include: {
                            user: true,
                        },
                    },
                },
            });

            const key = `${Constants.ROOM_PREFIX}${id}`;
            await redisClient.set(key, JSON.stringify(updated));

            const muted = await isRoomMuted({
                roomId: updated.id,
                userId: userReq.user.id,
                redisClient,
            });

            const pinned = await isRoomPinned({
                roomId: updated.id,
                userId: userReq.user.id,
                redisClient,
            });

            const sanitizedRoom = sanitize({ ...updated, muted, pinned }).room();
            sseRoomsNotify(sanitizedRoom, Constants.PUSH_TYPE_DELETE_ROOM);

            res.send(successResponse({ room: sanitizedRoom }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.post(
        "/:id/leave",
        validate(leaveRoomSchema),
        auth,
        async (req: Request, res: Response) => {
            const userReq: UserRequest = req as UserRequest;

            try {
                const id = parseInt((req.params.id as string) || "");
                const { adminUserIds } = req.body;

                const room = await prisma.room.findFirst({
                    where: { id },
                    include: { users: true },
                });

                if (!room) {
                    return res.status(404).send(errorResponse("Not found", userReq.lang));
                }

                const isRoomUser = isRoomUserCheck(userReq.user.id, room.users);

                if (!isRoomUser) {
                    return res.status(404).send(errorResponse("Not found", userReq.lang));
                }

                if (room.type === "private") {
                    return res
                        .status(403)
                        .send(errorResponse("Can't leave private room", userReq.lang));
                }

                const canLeaveRoom = canLeaveRoomCheck(userReq.user.id, room.users);
                const roomUserId = room.users.find((u) => u.userId === userReq.user.id)?.id;

                let updated: Room & {
                    users: (RoomUser & {
                        user: User;
                    })[];
                };

                if (canLeaveRoom) {
                    updated = await prisma.room.update({
                        where: { id },
                        data: {
                            users: {
                                deleteMany: [{ id: roomUserId }],
                            },
                        },
                        include: {
                            users: {
                                include: {
                                    user: true,
                                },
                            },
                        },
                    });
                } else {
                    if (!adminUserIds) {
                        return res
                            .status(400)
                            .send(errorResponse(`New admin(s) must be defined`, userReq.lang));
                    }

                    const foundUsers = await prisma.user.findMany({
                        where: { id: { in: adminUserIds } },
                    });

                    if (!foundUsers.length) {
                        return res
                            .status(400)
                            .send(errorResponse(`New admin(s) must be defined`, userReq.lang));
                    }

                    const foundUsersIds = foundUsers.map((u) => u.id);

                    const roomUsersToPromote = room.users.filter((u) =>
                        foundUsersIds.includes(u.userId)
                    );

                    updated = await prisma.room.update({
                        where: { id },
                        data: {
                            users: {
                                deleteMany: [
                                    { id: roomUserId },
                                    ...roomUsersToPromote.map((u) => ({ id: u.id })),
                                ],
                                createMany: {
                                    data: foundUsersIds.map((userId) => ({
                                        userId,
                                        isAdmin: true,
                                    })),
                                },
                            },
                            modifiedAt: new Date(),
                        },
                        include: {
                            users: {
                                include: {
                                    user: true,
                                },
                            },
                        },
                    });
                }

                const key = `${Constants.ROOM_PREFIX}${id}`;
                await redisClient.set(key, JSON.stringify(updated));

                const muted = await isRoomMuted({
                    roomId: updated.id,
                    userId: userReq.user.id,
                    redisClient,
                });

                const pinned = await isRoomPinned({
                    roomId: updated.id,
                    userId: userReq.user.id,
                    redisClient,
                });

                const sanitizedRoom = sanitize({ ...updated, muted, pinned }).room();
                sseRoomsNotify(sanitizedRoom, Constants.PUSH_TYPE_UPDATE_ROOM);

                res.send(successResponse({ room: sanitizedRoom }, userReq.lang));
            } catch (e: any) {
                le(e);
                res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
            }
        }
    );

    router.get("/", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        try {
            const page: number = parseInt(req.query.page ? (req.query.page as string) : "") || 1;
            const keyword: string = req.query.keyword as string;

            const rooms = await prisma.room.findMany({
                where: {
                    users: {
                        some: {
                            userId: userReq.user.id,
                        },
                    },
                    deleted: false,
                    name: {
                        startsWith: keyword,
                    },
                },
                include: {
                    users: {
                        include: {
                            user: true,
                        },
                    },
                },
                orderBy: [
                    {
                        createdAt: "asc",
                    },
                ],
                skip: Constants.PAGING_LIMIT * (page - 1),
                take: Constants.PAGING_LIMIT,
            });

            const count = await prisma.room.count({
                where: {
                    users: {
                        some: {
                            userId: userReq.user.id,
                        },
                    },
                    name: {
                        startsWith: keyword,
                    },
                },
            });

            const list = await Promise.all(
                rooms.map(async (room) => {
                    const muted = await isRoomMuted({
                        roomId: room.id,
                        userId: userReq.user.id,
                        redisClient,
                    });

                    const pinned = await isRoomPinned({
                        roomId: room.id,
                        userId: userReq.user.id,
                        redisClient,
                    });

                    const key = `${Constants.ROOM_PREFIX}${room.id}`;
                    await redisClient.set(key, JSON.stringify(room));

                    return sanitize({ ...room, muted, pinned }).room();
                })
            );

            res.send(
                successResponse(
                    {
                        list,
                        count,
                        limit: Constants.PAGING_LIMIT,
                    },
                    userReq.lang
                )
            );
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.get("/users/:userId", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        try {
            const userId = parseInt((req.params.userId as string) || "");
            const user = await prisma.user.findFirst({ where: { id: userId } });

            if (!user) {
                return res.status(404).send(errorResponse("Room not found", userReq.lang));
            }

            // Get room id where two user belongs to.
            const query = `
                    select * from room 
                        where type = 'private' 
                        and deleted = false 
                        and id in ( 
                            select room_id from room_user where user_id in 
                                (
                                    ${userId},${userReq.user.id}
                                ) group by room_id having count(*) > 1 
                        )`;

            const existingRoomResult: Room[] = await prisma.$queryRawUnsafe<Room[]>(query);

            if (existingRoomResult.length === 0) {
                return res.status(404).send(errorResponse("Room not found", userReq.lang));
            }

            const room = await getRoomById(existingRoomResult[0].id, redisClient);

            if (!room || room.users.length < 2) {
                return res.status(404).send(errorResponse("Room not found", userReq.lang));
            }

            const muted = await isRoomMuted({
                roomId: room.id,
                userId: userReq.user.id,
                redisClient,
            });

            const pinned = await isRoomPinned({
                roomId: room.id,
                userId: userReq.user.id,
                redisClient,
            });

            res.send(
                successResponse({ room: sanitize({ ...room, muted, pinned }).room() }, userReq.lang)
            );
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.get("/:id", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        try {
            const id = parseInt((req.params.id as string) || "");

            if (!id) {
                return res.status(404).send(errorResponse("Room not found", userReq.lang));
            }

            const room = await getRoomById(id, redisClient);

            if (!room) {
                return res.status(404).send(errorResponse("Room not found", userReq.lang));
            }

            const roomUser = room.users.find((u) => u.userId === userReq.user.id);

            if (!roomUser) {
                return res.status(404).send(errorResponse("Room not found", userReq.lang));
            }

            if (room.type === "private" && room.users.length < 2) {
                return res.status(404).send(errorResponse("Room not found", userReq.lang));
            }

            const muted = await isRoomMuted({
                roomId: room.id,
                userId: userReq.user.id,
                redisClient,
            });

            const pinned = await isRoomPinned({
                roomId: room.id,
                userId: userReq.user.id,
                redisClient,
            });

            res.send(
                successResponse({ room: sanitize({ ...room, muted, pinned }).room() }, userReq.lang)
            );
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

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

            const userSettings = await prisma.userSetting.findMany({
                where: {
                    userId,
                    key: { startsWith: Constants.ROOM_MUTE_PREFIX },
                    value: "true",
                    modifiedAt: { gt: new Date(lastUpdate) },
                },
            });

            const roomIds = userSettings.map((u) => +u.key.split("_")[1]);

            const roomsUser = await prisma.roomUser.findMany({
                where: {
                    userId,
                    room: {
                        OR: [{ modifiedAt: { gt: new Date(lastUpdate) } }, { id: { in: roomIds } }],
                    },
                },
            });

            const roomsSanitized = await Promise.all(
                roomsUser.map(async ({ roomId, createdAt }) => {
                    const room = await getRoomById(roomId, redisClient);
                    const muted = await isRoomMuted({
                        roomId,
                        userId,
                        redisClient,
                    });

                    const pinned = await isRoomPinned({
                        roomId,
                        userId,
                        redisClient,
                    });

                    const unreadCount = await getRoomUnreadCount({
                        roomId,
                        userId,
                        redisClient,
                        roomUserCreatedAt: createdAt,
                    });

                    return sanitize({ ...room, muted, pinned, unreadCount }).room();
                })
            );

            res.send(successResponse({ rooms: roomsSanitized }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.post("/:id/mute", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        try {
            const id = parseInt((req.params.id as string) || "");

            if (!id) {
                return res.status(400).send(errorResponse("id is required", userReq.lang));
            }

            const room = await getRoomById(id, redisClient);

            if (!room) {
                return res.status(404).send(errorResponse("Room not found", userReq.lang));
            }

            const roomsUser = isRoomUserCheck(userReq.user.id, room.users);

            if (!roomsUser) {
                return res
                    .status(404)
                    .send(errorResponse("User is not the member of the room.", userReq.lang));
            }

            await prisma.userSetting.upsert({
                create: {
                    key: `${Constants.ROOM_MUTE_PREFIX}${id}`,
                    value: "true",
                    userId: userReq.user.id,
                },
                update: {
                    value: "true",
                    modifiedAt: new Date(),
                },
                where: {
                    userId_key_unique_constraint: {
                        userId: userReq.user.id,
                        key: `${Constants.ROOM_MUTE_PREFIX}${id}`,
                    },
                },
            });

            const key = `${Constants.ROOM_MUTE_PREFIX}${userReq.user.id}_${id}`;
            await redisClient.set(key, 1);

            const pinned = await isRoomPinned({
                roomId: room.id,
                userId: userReq.user.id,
                redisClient,
            });

            const sanitizedRoom = sanitize({ ...room, muted: true, pinned }).room();
            sseRoomsNotify(sanitizedRoom, Constants.PUSH_TYPE_UPDATE_ROOM);

            res.send(successResponse({ room: sanitizedRoom }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.post("/:id/unmute", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        try {
            const id = parseInt((req.params.id as string) || "");

            if (!id) {
                return res.status(400).send(errorResponse("id is required", userReq.lang));
            }

            const room = await getRoomById(id, redisClient);

            if (!room) {
                return res.status(404).send(errorResponse("Room not found", userReq.lang));
            }

            const roomsUser = isRoomUserCheck(userReq.user.id, room.users);

            if (!roomsUser) {
                return res
                    .status(404)
                    .send(errorResponse("User is not the member of the room.", userReq.lang));
            }

            await prisma.userSetting.delete({
                where: {
                    userId_key_unique_constraint: {
                        userId: userReq.user.id,
                        key: `${Constants.ROOM_MUTE_PREFIX}${id}`,
                    },
                },
            });

            const key = `${Constants.ROOM_MUTE_PREFIX}${userReq.user.id}_${id}`;
            await redisClient.set(key, 0);

            const pinned = await isRoomPinned({
                roomId: room.id,
                userId: userReq.user.id,
                redisClient,
            });

            const sanitizedRoom = sanitize({ ...room, muted: false, pinned }).room();
            sseRoomsNotify(sanitizedRoom, Constants.PUSH_TYPE_UPDATE_ROOM);

            res.send(successResponse({ room: sanitizedRoom }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.post("/:id/pin", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        try {
            const id = parseInt((req.params.id as string) || "");

            if (!id) {
                return res.status(400).send(errorResponse("id is required", userReq.lang));
            }

            const room = await getRoomById(id, redisClient);

            if (!room) {
                return res.status(404).send(errorResponse("Room not found", userReq.lang));
            }

            const roomsUser = isRoomUserCheck(userReq.user.id, room.users);

            if (!roomsUser) {
                return res
                    .status(404)
                    .send(errorResponse("User is not the member of the room.", userReq.lang));
            }

            await prisma.userSetting.upsert({
                create: {
                    key: `${Constants.ROOM_PIN_PREFIX}${id}`,
                    value: "true",
                    userId: userReq.user.id,
                },
                update: {
                    value: "true",
                    modifiedAt: new Date(),
                },
                where: {
                    userId_key_unique_constraint: {
                        userId: userReq.user.id,
                        key: `${Constants.ROOM_PIN_PREFIX}${id}`,
                    },
                },
            });

            const key = `${Constants.ROOM_PIN_PREFIX}${userReq.user.id}_${id}`;
            await redisClient.set(key, 1);

            const muted = await isRoomMuted({
                roomId: room.id,
                userId: userReq.user.id,
                redisClient,
            });

            const sanitizedRoom = sanitize({ ...room, pinned: true, muted }).room();
            sseRoomsNotify(sanitizedRoom, Constants.PUSH_TYPE_UPDATE_ROOM);

            res.send(successResponse({ room: sanitizedRoom }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.post("/:id/unpin", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        try {
            const id = parseInt((req.params.id as string) || "");

            if (!id) {
                return res.status(400).send(errorResponse("id is required", userReq.lang));
            }

            const room = await getRoomById(id, redisClient);

            if (!room) {
                return res.status(404).send(errorResponse("Room not found", userReq.lang));
            }

            const roomsUser = isRoomUserCheck(userReq.user.id, room.users);

            if (!roomsUser) {
                return res
                    .status(404)
                    .send(errorResponse("User is not the member of the room.", userReq.lang));
            }

            await prisma.userSetting.delete({
                where: {
                    userId_key_unique_constraint: {
                        userId: userReq.user.id,
                        key: `${Constants.ROOM_PIN_PREFIX}${id}`,
                    },
                },
            });

            const key = `${Constants.ROOM_PIN_PREFIX}${userReq.user.id}_${id}`;
            await redisClient.set(key, 0);

            const muted = await isRoomMuted({
                roomId: room.id,
                userId: userReq.user.id,
                redisClient,
            });

            const sanitizedRoom = sanitize({ ...room, pinned: false, muted }).room();
            sseRoomsNotify(sanitizedRoom, Constants.PUSH_TYPE_UPDATE_ROOM);

            res.send(successResponse({ room: sanitizedRoom }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    return router;
};

export async function getRoomById(id: number, redisClient: ReturnType<typeof createClient>) {
    const key = `${Constants.ROOM_PREFIX}${id}`;
    const room = await redisClient.get(key);

    if (room) {
        return JSON.parse(room) as Room & {
            users: (RoomUser & {
                user: User;
            })[];
        };
    }

    const roomFromDb = await prisma.room.findUnique({
        where: {
            id,
        },
        include: {
            users: {
                include: {
                    user: true,
                },
            },
        },
    });
    await redisClient.set(key, JSON.stringify(roomFromDb));

    return roomFromDb;
}

export async function getRoomUnreadCount({
    roomId,
    userId,
    redisClient,
    roomUserCreatedAt,
}: {
    roomId: number;
    userId: number;
    roomUserCreatedAt: Date;
    redisClient: ReturnType<typeof createClient>;
}) {
    const key = `${Constants.UNREAD_PREFIX}${roomId}_${userId}`;
    let unreadCount = await redisClient.get(key);
    if (!unreadCount) {
        const unreadMessages = await prisma.message.findMany({
            where: {
                roomId: roomId,
                createdAt: {
                    gt: roomUserCreatedAt,
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
        redisClient.set(key, unreadCount);
    }

    return +unreadCount || 0;
}

function getRoomName(initialName: string, usersCount: number) {
    if (initialName) {
        return initialName;
    }

    switch (usersCount) {
        case 1: {
            return "Private room";
        }
        case 2: {
            return "";
        }
        default: {
            return "Untitled room";
        }
    }
}

function isAdminCheck(userId: number, roomUsers: RoomUser[]) {
    return roomUsers
        .filter((u) => u.isAdmin)
        .map((u) => u.userId)
        .includes(userId);
}

function isRoomUserCheck(userId: number, roomUsers: RoomUser[]) {
    return roomUsers.map((u) => u.userId).includes(userId);
}

function canLeaveRoomCheck(userId: number, roomUsers: RoomUser[]) {
    const roomUser = roomUsers.find((u) => u.userId === userId);

    if (!roomUser.isAdmin) {
        return true;
    }

    const adminCount = roomUsers.filter((u) => u.isAdmin).length;
    if (adminCount > 1) {
        return true;
    }

    return false;
}

type UpdateRoomUsersParams = {
    room: Room & { users: RoomUser[] };
    newIds: number[];
};

async function updateRoomUsers({ newIds, room }: UpdateRoomUsersParams): Promise<void> {
    const currentIds = room.users.map((u) => u.userId);

    const foundUsers = await prisma.user.findMany({
        where: { id: { in: newIds } },
        select: { id: true },
    });
    const foundUserIds = foundUsers.map((u) => u.id);

    const userIdsToRemove = currentIds.filter((id) => !foundUserIds.includes(id));
    await prisma.roomUser.deleteMany({
        where: { roomId: room.id, userId: { in: userIdsToRemove }, isAdmin: false },
    });

    const userIdsToAdd = foundUserIds.filter((id) => !currentIds.includes(id));
    await prisma.roomUser.createMany({
        data: userIdsToAdd.map((userId) => ({ userId, roomId: room.id, isAdmin: false })),
    });
}

type UpdateRoomAdminUsersParams = {
    room: Room & { users: RoomUser[] };
    newAdminIds: number[];
};

async function updateRoomAdminUsers({
    newAdminIds,
    room,
}: UpdateRoomAdminUsersParams): Promise<void> {
    const currentAdminIds = room.users.filter((u) => u.isAdmin).map((u) => u.userId);

    const newAdmins = await prisma.user.findMany({
        where: { id: { in: newAdminIds } },
        select: { id: true },
    });
    const newAdminUserIds = newAdmins.map((u) => u.id);

    const userAdminIdsToRemove = currentAdminIds.filter((id) => !newAdminUserIds.includes(id));
    await prisma.roomUser.updateMany({
        where: { roomId: room.id, userId: { in: userAdminIdsToRemove }, isAdmin: true },
        data: { isAdmin: false },
    });

    await prisma.roomUser.updateMany({
        where: { roomId: room.id, userId: { in: newAdminUserIds }, isAdmin: false },
        data: { isAdmin: true },
    });
}

export async function isRoomMuted({
    userId,
    roomId,
    redisClient,
}: {
    roomId: number;
    userId: number;
    redisClient: ReturnType<typeof createClient>;
}): Promise<boolean> {
    const key = `${Constants.ROOM_MUTE_PREFIX}${userId}_${roomId}`;

    let mutedString = await redisClient.get(key);

    if (!mutedString) {
        const userSettings = await prisma.userSetting.findFirst({
            where: { userId, key: `${Constants.ROOM_MUTE_PREFIX}${roomId}` },
        });

        mutedString = Number(userSettings?.value === "true").toString();

        await redisClient.set(key, mutedString);
    }

    return Boolean(Number(mutedString));
}

export async function isRoomPinned({
    userId,
    roomId,
    redisClient,
}: {
    roomId: number;
    userId: number;
    redisClient: ReturnType<typeof createClient>;
}): Promise<boolean> {
    const key = `${Constants.ROOM_PIN_PREFIX}${userId}_${roomId}`;

    let pinnedString = await redisClient.get(key);

    if (!pinnedString) {
        const userSettings = await prisma.userSetting.findFirst({
            where: { userId, key: `${Constants.ROOM_PIN_PREFIX}${roomId}` },
        });

        pinnedString = Number(userSettings?.value === "true").toString();

        await redisClient.set(key, pinnedString);
    }

    return Boolean(Number(pinnedString));
}
