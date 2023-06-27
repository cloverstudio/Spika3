import { Request, Response, RequestHandler } from "express";

import { UserRequest } from "../../lib/types";
import { error as le } from "../../../../components/logger";

import auth from "../../lib/auth";

import { InitRouterParams } from "../../../types/serviceInterface";
import { errorResponse, successResponse } from "../../../../components/response";
import prisma from "../../../../components/prisma";
import * as Constants from "../../../../components/consts";

export default ({}: InitRouterParams): RequestHandler[] => {
    return [
        auth,
        async (req: Request, res: Response) => {
            const userReq: UserRequest = req as UserRequest;
            const device = userReq.device;
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

                const deviceMessagesIds = await prisma.deviceMessage.findMany({
                    where: {
                        userId,
                        body: {
                            path: "$.text",
                            string_contains: keyword,
                        },
                        message: {
                            roomId,
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

                const messagesIds = Array.from(
                    new Set(deviceMessagesIds.map((dm) => dm.messageId))
                );

                le(`Found ${messagesIds.length} messages`);

                return res.send(successResponse({ messagesIds }, userReq.lang));
            } catch (e: any) {
                le(e);
                res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
            }
        },
    ];
};
