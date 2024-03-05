import { Request, Response, RequestHandler } from "express";

import { UserRequest } from "../../lib/types";
import { error as le } from "../../../../components/logger";

import auth from "../../lib/auth";

import { InitRouterParams } from "../../../types/serviceInterface";
import { errorResponse, successResponse } from "../../../../components/response";
import prisma from "../../../../components/prisma";

export default ({}: InitRouterParams): RequestHandler[] => {
    return [
        auth,
        async (req: Request, res: Response) => {
            const userReq: UserRequest = req as UserRequest;
            const userId = userReq.user.id;

            try {
                const roomId = parseInt(req.query.roomId as string);
                const keywordRaw = req.query.keyword as string;
                const itemsPerBatch = parseInt(req.query.itemsPerBatch as string) || 20;
                const cursor = req.query.cursor ? parseInt(req.query.cursor as string) : undefined;

                if (!roomId) {
                    return res.status(400).send(errorResponse("roomId required", userReq.lang));
                }

                const roomUser = await prisma.roomUser.findFirst({
                    where: { roomId, userId },
                });

                if (!roomUser) {
                    return res.status(404).send(errorResponse("No room found", userReq.lang));
                }

                const room = await prisma.room.findUnique({
                    where: { id: roomId },
                });

                if (!room) {
                    return res.status(404).send(errorResponse("No room found", userReq.lang));
                }

                if (!keywordRaw || !keywordRaw.trim()) {
                    return res.status(400).send(errorResponse("Keyword required", userReq.lang));
                }

                const keyword = keywordRaw.trim();

                if (keyword.length < 3) {
                    return res
                        .status(400)
                        .send(errorResponse("Keyword must be at least 3 characters", userReq.lang));
                }

                const firstChar = keyword[0];

                const isUpperCased = firstChar === firstChar.toUpperCase();

                const keywordWithOppositeFirstChar = isUpperCased
                    ? firstChar.toLowerCase() + keyword.slice(1)
                    : firstChar.toUpperCase() + keyword.slice(1);

                const [lowerKeyword] = [keyword.toLowerCase(), keyword.toUpperCase()];

                const keywords = Array.from(
                    new Set([keyword, keywordWithOppositeFirstChar, lowerKeyword]),
                );

                const count = (
                    await prisma.deviceMessage.findMany({
                        where: {
                            OR: [
                                ...keywords.map((key) => ({
                                    body: {
                                        path: "$.text",
                                        string_contains: key,
                                    },
                                })),
                            ],
                            AND: {
                                deleted: false,
                                message: {
                                    roomId,
                                    type: "text",
                                },
                            },
                        },
                        distinct: ["messageId"],
                    })
                ).length;

                const deviceMessages = await prisma.deviceMessage.findMany({
                    where: {
                        OR: [
                            ...keywords.map((key) => ({
                                body: {
                                    path: "$.text",
                                    string_contains: key,
                                },
                            })),
                        ],
                        AND: {
                            deleted: false,
                            message: {
                                roomId,
                                type: "text",
                            },
                        },
                    },
                    distinct: ["messageId"],
                    orderBy: {
                        createdAt: "desc",
                    },
                    select: {
                        id: true,
                        messageId: true,
                        body: true,
                        createdAt: true,
                        message: {
                            select: {
                                fromUser: {
                                    select: {
                                        id: true,
                                        displayName: true,
                                    },
                                },
                                type: true,
                            },
                        },
                    },
                    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
                    take: itemsPerBatch,
                });

                const transformedDeviceMessages = deviceMessages.map((deviceMessage) => ({
                    id: deviceMessage.id,
                    messageId: deviceMessage.messageId,
                    type: deviceMessage.message.type,
                    body: deviceMessage.body,
                    userId: deviceMessage.message.fromUser.id,
                    username: deviceMessage.message.fromUser.displayName,
                    date: deviceMessage.createdAt,
                }));

                return res.send(
                    successResponse({ list: transformedDeviceMessages, count }, userReq.lang),
                );
            } catch (e: any) {
                le(e);
                res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
            }
        },
    ];
};
