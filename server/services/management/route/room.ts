import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import adminAuth from "../lib/adminAuth";
import * as consts from "../../../components/consts";

import l, { error as le } from "../../../components/logger";

import { InitRouterParams } from "../../types/serviceInterface";
import { successResponse, errorResponse } from "../../../components/response";
import { UserRequest } from "../../messenger/lib/types";
import { Room, RoomUser, User } from "@prisma/client";

export default (params: InitRouterParams) => {
    const router = Router();

    router.put("/userAdmin", adminAuth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        try {
            const roomId: number =
                parseInt(req.query.roomId ? (req.query.roomId as string) : "") || 0;
            const userId: number =
                parseInt(req.query.userId ? (req.query.userId as string) : "") || 0;

            const roomUser = await prisma.roomUser.findFirst({
                where: {
                    roomId: roomId,
                    userId: userId,
                },
            });

            const updateRoomUser = await prisma.roomUser.updateMany({
                where: {
                    roomId: roomId,
                    userId: userId,
                },
                data: {
                    isAdmin: !roomUser.isAdmin,
                },
            });

            return res.send(successResponse({ room: updateRoomUser }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.put("/addUsers", adminAuth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        try {
            const roomId: number =
                parseInt(req.query.roomId ? (req.query.roomId as string) : "") || 0;
            const userIdsString = req.query.userIds;
            const userIds: string[] = JSON.parse("[" + userIdsString + "]");

            const array: { userId: number; roomId: number; isAdmin: boolean }[] = [];
            userIds.forEach((element) => {
                const model = { userId: Number(element), roomId: roomId, isAdmin: false };
                array.push(model);
            });

            const allRoomUsers = await prisma.roomUser.createMany({
                data: array,
            });

            return res.send(successResponse({ room: allRoomUsers }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.delete("/:roomId/:userId", adminAuth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        try {
            const roomId: number = parseInt(req.params.roomId);
            const userId: number = parseInt(req.params.userId);
            const allRoomUsers = await prisma.roomUser.deleteMany({
                where: {
                    roomId: roomId,
                    userId: userId,
                },
            });

            return res.send(successResponse({ users: allRoomUsers }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.get("/users", adminAuth, async (req: Request, res: Response) => {
        const roomId: number = Number(req.query.roomId);
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
            const name: string = req.body.name;
            const type: string = req.body.type;
            const avatarUrl: string = req.body.avatarUrl;
            const deleted: boolean = req.body.verified;

            if (!name) return res.status(400).send(errorResponse(`Name is required`, userReq.lang));
            if (!type)
                return res.status(400).send(errorResponse(`Type id is required`, userReq.lang));
            const newRoom = await prisma.room.create({
                data: {
                    name: name,
                    type: type,
                    avatarUrl: avatarUrl,
                    deleted: deleted,
                },
            });

            return res.send(successResponse({ room: newRoom }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    /**
     * TODO: impliment order
     */
    router.get("/", adminAuth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const page: number = parseInt(req.query.page ? (req.query.page as string) : "") || 0;
        const userId: number = parseInt(req.query.userId ? (req.query.userId as string) : "") || 0;
        const deleted: boolean = req.query.deleted == "true";
        try {
            var rooms: Room[] = null;
            if (userId == 0) {
                const clause = !deleted ? {} : { deleted: true };
                rooms = await prisma.room.findMany({
                    where: clause,
                    orderBy: [
                        {
                            createdAt: "asc",
                        },
                    ],
                    skip: consts.PAGING_LIMIT * page,
                    take: consts.PAGING_LIMIT,
                });
            } else {
                if (!deleted) {
                    rooms = await prisma.room.findMany({
                        where: {
                            users: {
                                some: {
                                    user: {
                                        id: userId,
                                    },
                                },
                            },
                        },
                        skip: consts.PAGING_LIMIT * page,
                        take: consts.PAGING_LIMIT,
                    });
                } else {
                    rooms = await prisma.room.findMany({
                        where: {
                            deleted: true,
                            users: {
                                some: {
                                    user: {
                                        id: userId,
                                    },
                                },
                            },
                        },
                        skip: consts.PAGING_LIMIT * page,
                        take: consts.PAGING_LIMIT,
                    });
                }
            }

            const count = userId == 0 && !deleted ? await prisma.room.count() : rooms.length;

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
            });

            if (!room) return res.status(404).send(errorResponse(`Wrong room id`, userReq.lang));

            return res.send(successResponse({ room }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.put("/:roomId", adminAuth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        try {
            const roomId: number = parseInt(req.params.roomId);
            const name: string = req.body.name;
            const type: string = req.body.type;
            const avatarUrl: string = req.body.avatarUrl;
            const deleted: boolean = req.body.deleted;
            const room = await prisma.room.findFirst({
                where: {
                    id: roomId,
                },
            });

            if (!room) return res.status(404).send(errorResponse(`Wrong room id`, userReq.lang));
            if (!name) return res.status(400).send(errorResponse(`Name is required`, userReq.lang));
            if (!type)
                return res.status(400).send(errorResponse(`Type id is required`, userReq.lang));
            const updateValues: any = {};
            if (name) updateValues.name = name;
            if (type) updateValues.type = type;
            if (avatarUrl) updateValues.avatarUrl = avatarUrl;
            if (deleted != null) updateValues.deleted = deleted;
            if (Object.keys(updateValues).length == 0)
                return res.status(400).send(errorResponse(`Nothing to update`, userReq.lang));

            const updateRoom = await prisma.room.update({
                where: { id: roomId },
                data: updateValues,
            });
            return res.send(successResponse({ room: updateRoom }, userReq.lang));
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

            const deleteResult = await prisma.room.delete({
                where: { id: roomId },
            });
            return res.send(successResponse("Room deleted", userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    return router;
};
