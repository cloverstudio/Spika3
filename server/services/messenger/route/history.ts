import { Router, Request, Response } from "express";
import { PrismaClient, RoomUser } from "@prisma/client";

import { error as le } from "../../../components/logger";
import validate from "../../../components/validateMiddleware";
import * as yup from "yup";
import { successResponse, errorResponse } from "../../../components/response";
import auth from "../lib/auth";
import { UserRequest } from "../lib/types";
import sanitize from "../../../components/sanitize";
import * as Constants from "../../../components/consts";

const prisma = new PrismaClient();

export default (): Router => {
    const router = Router();

    router.get("/", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const userId = userReq.user.id;
        const deviceId = userReq.device.id;
        const page = parseInt(req.query.page ? (req.query.page as string) : "") || 1;
        try {
            const roomUsers = await prisma.roomUser.findMany({
                where: {
                    userId,
                },

                include: { room: true },
            });

            const roomsIds = roomUsers.map((r) => r.room.id);

            const count = await prisma.room.count({
                where: {
                    id: { in: roomsIds },
                    messages: {
                        some: {},
                    },
                },
            });

            const messages = await prisma.message.findMany({
                where: {
                    roomId: { in: roomsIds },
                },
                distinct: ["roomId"],
                orderBy: {
                    modifiedAt: "desc",
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

            const deviceMessages = await prisma.deviceMessage.findMany({
                where: { userId, deviceId, messageId: { in: messages.map((m) => m.id) } },
                select: {
                    messageId: true,
                    messageBody: true,
                },
            });

            const list = messages.map((m) => {
                const { room, ...message } = m;
                const messageBody = deviceMessages.find((dm) => dm.messageId === m.id)?.messageBody;

                return {
                    ...sanitize(room).room(),
                    lastMessage: sanitize({
                        ...message,
                        ...(messageBody && { messageBody }),
                    }).message(),
                };
            });

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