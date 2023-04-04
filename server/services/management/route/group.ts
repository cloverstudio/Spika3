import { Router, Request, Response } from "express";

import adminAuth from "../lib/adminAuth";
import * as consts from "../../../components/consts";

import l, { error as le } from "../../../components/logger";

import { successResponse, errorResponse } from "../../../components/response";
import { UserRequest } from "../../messenger/lib/types";
import { Room } from "@prisma/client";
import prisma from "../../../components/prisma";
import sanitize from "../../../components/sanitize";

export default () => {
    const router = Router();

    router.put("/:roomId/add", adminAuth, async (req: Request, res: Response) => {
        try {
            const roomId = parseInt(req.params.roomId ? (req.params.roomId as string) : "");
            const usersIds = req.body.usersIds;
            const isAdmin = !!req.body.admin;

            if (!roomId) {
                return res.status(400).send(errorResponse("valid roomId is required", "en"));
            }

            const room = await prisma.room.findFirst({
                where: {
                    id: roomId,
                },
            });

            if (!room) {
                return res.status(404).send(errorResponse("Room Not Found", "en"));
            }

            if (room.type !== "group") {
                return res.status(400).send(errorResponse("Room is not a group", "en"));
            }

            if (!usersIds || !usersIds.length) {
                return res.status(400).send(errorResponse("valid usersIds is required", "en"));
            }

            const currentRoomUsers = await prisma.roomUser.findMany({
                where: {
                    roomId,
                    isAdmin,
                },
            });

            const toAdd = usersIds.filter(
                (id) => !currentRoomUsers.find((roomUser) => roomUser.userId === id)
            );

            const roomUsers = toAdd.map((userId) => ({ userId, roomId, isAdmin }));

            if (isAdmin) {
                await prisma.roomUser.deleteMany({
                    where: {
                        roomId,
                        userId: {
                            in: toAdd,
                        },
                        isAdmin: false,
                    },
                });
            }

            const allRoomUsers = await prisma.roomUser.createMany({
                data: roomUsers,
            });

            return res.send(successResponse({ added: toAdd, groupId: roomId }, "en"));
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, "en"));
        }
    });

    router.delete("/:roomId/:userId", adminAuth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        try {
            const roomId = parseInt(req.params.roomId);
            const userId = parseInt(req.params.userId);

            const roomUser = await prisma.roomUser.findFirst({
                where: {
                    roomId,
                    userId,
                },
            });

            if (!roomUser) {
                return res.status(404).send(errorResponse("Room User Not Found", userReq.lang));
            }

            if (roomUser.isAdmin) {
                const otherAdmins = await prisma.roomUser.findMany({
                    where: {
                        roomId,
                        isAdmin: true,
                        userId: {
                            not: userId,
                        },
                    },
                });

                if (otherAdmins.length === 0) {
                    return res
                        .status(400)
                        .send(
                            errorResponse(
                                "Can't remove user because he is last admin in that group",
                                userReq.lang
                            )
                        );
                }
            }

            await prisma.roomUser.deleteMany({
                where: {
                    roomId,
                    userId,
                },
            });

            return res.send(successResponse({ removed: { roomId, userId } }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.get("/users", adminAuth, async (req: Request, res: Response) => {
        const roomId = Number(req.query.roomId);
        const userReq: UserRequest = req as UserRequest;

        try {
            const room = await prisma.room.findUnique({
                where: { id: roomId },
                include: { users: true },
            });

            const userIds = room.users.map((ru) => ru.userId);
            const users = await prisma.user.findMany({
                where: { id: { in: userIds } },
            });
            return res.send(
                successResponse(
                    {
                        room: room,
                        users: users,
                    },
                    userReq.lang
                )
            );
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.get("/search", adminAuth, async (req: Request, res: Response) => {
        const searchTerm: string = req.query.searchTerm ? (req.query.searchTerm as string) : "";
        const userReq: UserRequest = req as UserRequest;

        try {
            const allRooms: Room[] = await prisma.room.findMany({
                where: {
                    OR: [
                        {
                            name: {
                                contains: searchTerm,
                            },
                        },
                    ],
                },
            });
            const count = allRooms.length;

            return res.send(
                successResponse(
                    {
                        list: allRooms,
                        count: count,
                        limit: consts.PAGING_LIMIT,
                    },
                    userReq.lang
                )
            );
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.get("/group", adminAuth, async (req: Request, res: Response) => {
        const page: number = parseInt(req.query.page ? (req.query.page as string) : "") || 0;
        const type: string = req.query.type ? (req.query.type as string) : "";
        const userReq: UserRequest = req as UserRequest;
        // if (type.length > 0) {
        try {
            const rooms = await prisma.room.findMany({
                where: {
                    type: type,
                },
                orderBy: [
                    {
                        createdAt: "asc",
                    },
                ],
                skip: consts.PAGING_LIMIT * page,
                take: consts.PAGING_LIMIT,
            });

            const count = rooms.length;
            res.send(
                successResponse(
                    {
                        list: rooms,
                        count: count,
                        limit: consts.PAGING_LIMIT,
                    },
                    userReq.lang
                )
            );
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
        // }
    });

    router.post("/", adminAuth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        try {
            const name = req.body.name as string;
            const avatarFileId = parseInt(req.body.avatarFileId || "0");

            if (!name) return res.status(400).send(errorResponse(`Name is required`, userReq.lang));

            const newRoom = await prisma.room.create({
                data: {
                    name: name,
                    avatarFileId,
                    type: "group",
                },
            });

            return res.send(successResponse({ room: newRoom }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.get("/", adminAuth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const page = parseInt(req.query.page ? (req.query.page as string) : "") || 1;

        const rooms = await prisma.room.findMany({
            where: {
                deleted: false,
                type: "group",
            },
            orderBy: {
                createdAt: "asc",
            },
            include: {
                users: true,
            },
            skip: consts.PAGING_LIMIT * page,
            take: consts.PAGING_LIMIT,
        });

        try {
            const count = await prisma.room.count({
                where: {
                    deleted: false,
                    type: "group",
                },
            });

            res.send(
                successResponse(
                    {
                        list: rooms,
                        count: count,
                        limit: consts.PAGING_LIMIT,
                    },
                    userReq.lang
                )
            );
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.get("/:roomId", adminAuth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        try {
            const roomId: number = parseInt(req.params.roomId);
            // check existance
            const room = await prisma.room.findFirst({
                where: {
                    id: roomId,
                },
                include: {
                    users: {
                        include: {
                            user: true,
                        },
                    },
                },
            });

            if (!room) return res.status(404).send(errorResponse(`Wrong room id`, userReq.lang));

            return res.send(successResponse({ group: sanitize(room).room() }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.put("/:roomId", adminAuth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        try {
            const roomId = parseInt(req.params.roomId);
            const name: string = req.body.name;
            const avatarFileId = parseInt(req.body.avatarFileId || "0");

            const room = await prisma.room.findFirst({
                where: {
                    id: roomId,
                },
            });

            if (!room) {
                return res.status(404).send(errorResponse(`Wrong room id`, userReq.lang));
            }

            if (!name) return res.status(400).send(errorResponse(`Name is required`, userReq.lang));

            const updateRoom = await prisma.room.update({
                where: { id: roomId },
                data: {
                    name,
                    avatarFileId,
                    modifiedAt: new Date(),
                },
            });
            return res.send(successResponse({ group: updateRoom }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.delete("/:roomId", adminAuth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        try {
            const roomId: number = parseInt(req.params.roomId);
            // check existance
            const room = await prisma.room.findFirst({
                where: {
                    id: roomId,
                },
            });

            if (!room) return res.status(404).send(errorResponse(`Wrong room id`, userReq.lang));

            await prisma.room.update({
                where: { id: roomId },
                data: {
                    deleted: true,
                    modifiedAt: new Date(),
                },
            });
            return res.send(successResponse({ deleted: true }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    return router;
};
