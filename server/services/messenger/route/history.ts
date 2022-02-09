import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

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
        const page: number = parseInt(req.query.page ? (req.query.page as string) : "") || 1;
        try {
            const roomUsers = await prisma.roomUser.findMany({
                where: {
                    userId,
                    room: {
                        messages: {
                            every: {
                                id: { gt: 0 }, // hack to get only rooms with messages
                            },
                        },
                    },
                },

                select: { room: true },
            });

            const roomsIds = roomUsers.map((r) => r.room.id);

            const messages = await prisma.message.findMany({
                where: {
                    roomId: { in: roomsIds },
                    deviceMessages: {
                        some: {
                            deviceId,
                        },
                    },
                },
                distinct: ["roomId"],
                orderBy: {
                    modifiedAt: "desc",
                },
                skip: Constants.PAGING_LIMIT * (page - 1),
                take: Constants.PAGING_LIMIT,
                select: {
                    id: true,
                    fromUserId: true,
                    type: true,
                    createdAt: true,
                    modifiedAt: true,
                    room: {
                        select: {
                            id: true,
                            type: true,
                            name: true,
                            avatarUrl: true,
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

            const rooms = messages.map((m) => {
                const { room, ...message } = m;
                const messageBody = deviceMessages.find((dm) => dm.messageId === m.id)?.messageBody;

                return {
                    ...room,
                    lastMessage: { ...message, ...(messageBody && { messageBody }) },
                };
            });

            res.send(
                successResponse({
                    list: rooms,
                    count: roomsIds.length,
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
