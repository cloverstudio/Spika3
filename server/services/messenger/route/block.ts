import { Router, Request, Response } from "express";

import { error as le } from "../../../components/logger";
import { successResponse, errorResponse } from "../../../components/response";
import auth from "../lib/auth";
import { UserRequest } from "../lib/types";
import prisma from "../../../components/prisma";
import sanitize from "../../../components/sanitize";

export default (): Router => {
    const router = Router();

    router.get("/", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        try {
            const blocks = await prisma.block.findMany({
                where: { userId: userReq.user.id },
                include: {
                    blocked: true,
                },
            });

            res.send(
                successResponse(
                    { blockedUsers: blocks.map((b) => sanitize(b.blocked).user()) },
                    userReq.lang
                )
            );
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

            let block = await prisma.block.findFirst({
                where: { userId: userReq.user.id, blockedId },
            });

            if (!block) {
                block = await prisma.block.create({
                    data: { userId: userReq.user.id, blockedId },
                });
            }

            res.send(successResponse({ block: sanitize(block).block() }, userReq.lang));
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

            await prisma.block.deleteMany({ where: { userId: userReq.user.id, blockedId } });

            res.send(successResponse({ deleted: true }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.delete("/:id", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const id = parseInt(req.params.id as string);
        console.log({ id });
        try {
            if (isNaN(id)) {
                return res.status(400).send(errorResponse("id must be number", userReq.lang));
            }

            await prisma.block.deleteMany({ where: { id, userId: userReq.user.id } });

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

            res.send(
                successResponse({ block: block ? sanitize(block).block() : null }, userReq.lang)
            );
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

    const block = await prisma.block.findFirst({
        where: { userId: userId, blockedId: otherUsers[0].userId },
    });

    return block;
}
