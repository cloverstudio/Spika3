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

                /* const devicesIds = await getDevicesIds(device, userId);

                async function getDevicesIds(device, userId) {
                    const isBrowser = userReq.device.type === Constants.DEVICE_TYPE_BROWSER;

                    if (isBrowser) {
                        const browserDevices = await prisma.device.findMany({
                            where: {
                                userId,
                                type: Constants.DEVICE_TYPE_BROWSER,
                            },
                            select: {
                                id: true,
                            },
                        });

                        return browserDevices.map((d) => d.id);
                    } else {
                        return [device.id];
                    }
                } */

                const deviceMessages = await prisma.deviceMessage.findMany({
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
                });

                le(`Search time: ${+new Date() - time}ms`);

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
