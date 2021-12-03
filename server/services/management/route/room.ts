import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import adminAuth from "../lib/adminAuth";
import * as consts from "../../../components/consts";

import l, { error as le } from "../../../components/logger";

import { InitRouterParams } from "../../types/serviceInterface";
import { successResponse, errorResponse } from "../../../components/response";
import { UserRequest } from "../../messenger/lib/types";
import { Room } from "@prisma/client";

export default (params: InitRouterParams) => {
    const router = Router();

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
