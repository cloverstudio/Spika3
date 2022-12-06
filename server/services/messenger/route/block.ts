import { Router, Request, Response } from "express";

import { error as le } from "../../../components/logger";
import { successResponse, errorResponse } from "../../../components/response";
import auth from "../lib/auth";
import { UserRequest } from "../lib/types";
import prisma from "../../../components/prisma";

export default (): Router => {
    const router = Router();

    router.get("/", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        try {
            const blocks = await prisma.userBlock.findMany({
                where: { userId: userReq.user.id },
                include: {
                    blocked: true,
                },
            });

            res.send(successResponse({ blockedUsers: blocks.map((b) => b.blocked) }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.post("/", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const blockedId = parseInt((req.body.blockedId as string) || "");

        try {
            if (!blockedId) {
                return res
                    .status(400)
                    .send(errorResponse("blockedId must be number", userReq.lang));
            }

            const blocked = await prisma.user.findUnique({ where: { id: blockedId } });

            if (!blocked) {
                return res
                    .status(404)
                    .send(errorResponse("there is no user with that blockedId", userReq.lang));
            }

            let block = await prisma.userBlock.findFirst({
                where: { userId: userReq.user.id, blockedId },
            });

            if (!block) {
                block = await prisma.userBlock.create({
                    data: { userId: userReq.user.id, blockedId },
                });
            }

            res.send(successResponse({ block }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.delete("/userId/:blockedId", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const blockedId = parseInt(req.params.blockedId as string);

        try {
            if (isNaN(blockedId)) {
                return res.status(400).send(errorResponse("blockId must be number", userReq.lang));
            }

            await prisma.userBlock.deleteMany({ where: { userId: userReq.user.id, blockedId } });

            res.send(successResponse({ deleted: true }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.delete("/:id", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const id = parseInt(req.params.id as string);

        try {
            if (isNaN(id)) {
                return res.status(400).send(errorResponse("id must be number", userReq.lang));
            }

            await prisma.userBlock.deleteMany({ where: { id, userId: userReq.user.id } });

            res.send(successResponse({ deleted: true }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.get("/rooms/:roomId", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const roomId = parseInt(req.params.roomId as string);

        try {
            const block = await getRoomBlock(roomId, userReq.user.id);

            res.send(successResponse({ blocked: block }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    return router;
};

export async function isRoomBlocked(roomId: number, userId: number) {
    const block = await getRoomBlock(roomId, userId);

    return !!block;
}

async function getRoomBlock(roomId: number, userId: number) {
    const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: { users: true },
    });

    if (!room) {
        return null;
    }

    if (room.type !== "private") {
        return null;
    }

    const otherUsers = room.users.filter((ru) => ru.userId !== userId);

    if (!otherUsers.length) {
        return null;
    }

    const block = await prisma.userBlock.findFirst({
        where: { userId: userId, blockedId: otherUsers[0].userId },
    });

    return block;
}
