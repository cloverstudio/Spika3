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

                const time = +new Date();
                console.log("searching...", keyword);

                const firstChar = keyword[0];

                const isUpperCased = firstChar === firstChar.toUpperCase();

                const keywordWithOppositeFirstChar = isUpperCased
                    ? firstChar.toLowerCase() + keyword.slice(1)
                    : firstChar.toUpperCase() + keyword.slice(1);

                const [lowerKeyword] = [keyword.toLowerCase(), keyword.toUpperCase()];

                const keywords = Array.from(
                    new Set([keyword, keywordWithOppositeFirstChar, lowerKeyword]),
                );

                const deviceMessageIds = await prisma.deviceMessage.findMany({
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
                            userId,
                            message: {
                                roomId,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                    select: {
                        messageId: true,
                    },
                });

                le(`Search time: ${+new Date() - time}ms`);

                const messageIds = Array.from(new Set(deviceMessageIds.map((dm) => dm.messageId)));

                le(`Found ${messageIds.length} messages`);

                return res.send(successResponse({ messageIds }, userReq.lang));
            } catch (e: any) {
                le(e);
                res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
            }
        },
    ];
};
