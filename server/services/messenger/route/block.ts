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

    router.delete("/:blockedId", auth, async (req: Request, res: Response) => {
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

    router.get("/rooms/:roomId", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const roomId = parseInt(req.params.roomId as string);

        try {
            const room = await prisma.room.findUnique({
                where: { id: roomId },
                include: { users: true },
            });

            if (!room) {
                return res.send(successResponse({ blocked: false }, userReq.lang));
            }

            if (room.type !== "private") {
                return res.send(successResponse({ blocked: false }, userReq.lang));
            }

            const otherUsers = room.users.filter((ru) => ru.userId !== userReq.user.id);
            console.log({ otherUsers });
            if (!otherUsers.length) {
                return res.send(successResponse({ blocked: false }, userReq.lang));
            }

            const block = await prisma.userBlock.findFirst({
                where: { userId: userReq.user.id, blockedId: otherUsers[0].userId },
            });

            res.send(successResponse({ blocked: !!block }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    return router;
};
