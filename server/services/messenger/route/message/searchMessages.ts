import { Request, Response, RequestHandler } from "express";

import { UserRequest } from "../../lib/types";
import { error as le } from "../../../../components/logger";

import auth from "../../lib/auth";

import { InitRouterParams } from "../../../types/serviceInterface";
import { errorResponse, successResponse } from "../../../../components/response";
import prisma from "../../../../components/prisma";

export default ({ redisClient }: InitRouterParams): RequestHandler[] => {
    return [
        auth,
        async (req: Request, res: Response) => {
            const userReq: UserRequest = req as UserRequest;
            const deviceId = userReq.device.id;
            const userId = userReq.user.id;

            try {
                const roomId = parseInt(req.params.roomId as string);
                const keyword = req.query.keyword as string;

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

                if (!keyword) {
                    return res.status(400).send(errorResponse("Keyword required", userReq.lang));
                }

                if (keyword.length < 3) {
                    return res
                        .status(400)
                        .send(errorResponse("Keyword must be at least 3 characters", userReq.lang));
                }

                const time = performance.now();
                console.log("searching...", keyword);
                const deviceMessages = await prisma.deviceMessage.findMany({
                    where: {
                        deviceId,
                        body: {
                            path: "$.text",
                            string_contains: keyword,
                        },
                    },
                });

                le(`Search time: ${performance.now() - time}ms`);

                le(`Found ${deviceMessages.length} messages`);

                le(deviceMessages.map((dm) => dm.messageId));

                return res.send(
                    successResponse(
                        { messagesIds: deviceMessages.map((dm) => dm.messageId) },
                        userReq.lang
                    )
                );
            } catch (e: any) {
                le(e);
                res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
            }
        },
    ];
};
