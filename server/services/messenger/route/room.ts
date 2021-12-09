import { Router, Request, Response } from "express";
import { PrismaClient, RoomUser, Room } from "@prisma/client";

import { UserRequest } from "../lib/types";
import { error as le } from "../../../components/logger";

import auth from "../lib/auth";
import * as yup from "yup";
import validate from "../../../components/validateMiddleware";
import { successResponse, errorResponse } from "../../../components/response";

const prisma = new PrismaClient();

const postRoomSchema = yup.object().shape({
    body: yup.object().shape({
        name: yup.string().default(""),
        avatarUrl: yup.string().default(""),
        type: yup.string().strict(),
        userIds: yup.array().default([]).of(yup.number().strict().moreThan(0)),
        adminUserIds: yup.array().default([]).of(yup.number().strict().moreThan(0)),
    }),
});

const patchRoomSchema = yup.object().shape({
    body: yup.object().shape({
        name: yup.string().strict(),
        avatarUrl: yup.string().strict(),
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

export default (): Router => {
    const router = Router();

    router.post("/", auth, validate(postRoomSchema), async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        try {
            const {
                avatarUrl,
                type: userDefinedType,
                userIds,
                adminUserIds,
                name: userDefinedName,
            } = req.body;

            if (!adminUserIds.includes(userReq.user.id)) {
                adminUserIds.push(userReq.user.id);
            }

            const foundUsers = await prisma.user.findMany({
                where: { id: { in: [...userIds, ...adminUserIds] } },
            });

            const users = foundUsers.map((user) => ({
                userId: user.id,
                isAdmin: adminUserIds.includes(user.id) || false,
            }));

            const type = userDefinedType || (userIds.length < 3 ? "private" : "group");
            const name = getRoomName(userDefinedName, users.length);

            const room = await prisma.room.create({
                data: {
                    name,
                    type,
                    avatarUrl,
                    users: {
                        create: users,
                    },
                },
                include: {
                    users: true,
                },
            });

            res.send(successResponse({ room }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.put("/:id", auth, validate(patchRoomSchema), async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        try {
            const id = parseInt((req.params.id as string) || "");
            const { userIds, adminUserIds, name, avatarUrl } = req.body;

            const room = await prisma.room.findFirst({ where: { id }, include: { users: true } });
            if (!room) {
                return res.status(404).send(errorResponse("Not found", userReq.lang));
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

                await updateRoomUsers({ room, newIds: adminUserIds, updatingAdmins: true });
            }

            const userCount = await prisma.roomUser.count({ where: { roomId: id } });

            const update: Partial<Room> = {
                ...(name && { name }),
                ...(avatarUrl && { avatarUrl }),
                ...(userCount > 2 && { type: "group" }),
            };

            const updated = await prisma.room.update({
                where: { id },
                data: update,
                include: { users: true },
            });

            res.send(successResponse({ room: updated }, userReq.lang));
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

            const userIsAdmin = isAdminCheck(userReq.user.id, room.users);
            if (!userIsAdmin) {
                return res.status(403).send(errorResponse("Forbidden", userReq.lang));
            }

            const updated = await prisma.room.update({
                where: { id },
                data: { deleted: true },
                include: { users: true },
            });

            res.send(successResponse({ room: updated }, userReq.lang));
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

                const canLeaveRoom = canLeaveRoomCheck(userReq.user.id, room.users);
                const roomUserId = room.users.find((u) => u.userId === userReq.user.id)?.id;

                if (canLeaveRoom) {
                    const updated = await prisma.room.update({
                        where: { id },
                        data: {
                            users: {
                                deleteMany: [{ id: roomUserId }],
                            },
                        },
                        include: { users: true },
                    });

                    return res.send(successResponse({ room: updated }, userReq.lang));
                }

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

                const updated = await prisma.room.update({
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
                    },
                    include: { users: true },
                });
                res.send(successResponse({ room: updated }, userReq.lang));
            } catch (e: any) {
                le(e);
                res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
            }
        }
    );

    return router;
};

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
            return "United room";
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

interface UpdateRoomUsersParams {
    room: Room & { users: RoomUser[] };
    newIds: number[];
    updatingAdmins?: boolean;
}

async function updateRoomUsers({
    newIds,
    room,
    updatingAdmins = false,
}: UpdateRoomUsersParams): Promise<void> {
    const currentIds = room.users.filter((u) => u.isAdmin === updatingAdmins).map((u) => u.userId);

    const foundUsers = await prisma.user.findMany({
        where: { id: { in: newIds } },
        select: { id: true },
    });
    const foundUserIds = foundUsers.map((u) => u.id);

    const userIdsToRemove = currentIds.filter((id) => !foundUserIds.includes(id));
    await prisma.roomUser.deleteMany({
        where: { userId: { in: userIdsToRemove }, isAdmin: updatingAdmins },
    });

    const userIdsToAdd = foundUserIds.filter((id) => !currentIds.includes(id));
    await prisma.roomUser.createMany({
        data: userIdsToAdd.map((userId) => ({ userId, roomId: room.id, isAdmin: updatingAdmins })),
    });
}