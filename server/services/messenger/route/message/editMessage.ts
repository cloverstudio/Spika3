import { Request, RequestHandler, Response } from "express";

import { UserRequest } from "../../lib/types";
import { error as le } from "../../../../components/logger";

import auth from "../../lib/auth";
import { successResponse, errorResponse } from "../../../../components/response";
import * as Constants from "../../../../components/consts";

import { InitRouterParams } from "../../../types/serviceInterface";
import sanitize from "../../../../components/sanitize";
import prisma from "../../../../components/prisma";
import { isRoomBlocked } from "../block";

export default ({ rabbitMQChannel }: InitRouterParams): RequestHandler[] => {
    return [
        auth,
        async (req: Request, res: Response) => {
            const userReq: UserRequest = req as UserRequest;
            const userId = userReq.user.id;
            const deviceId = userReq.device.id;

            try {
                const id = parseInt((req.params.id as string) || "");
                const text = req.body.text as string;
                const thumbnailData = req.body.thumbnailData;
                const hasLink = req.body.hasLink;

                if (!text) {
                    return res.status(400).send(errorResponse("Text is required", userReq.lang));
                }

                let message = await prisma.message.findFirst({
                    where: { id },
                    include: { deviceMessages: true },
                });

                if (!message) {
                    return res.status(404).send(errorResponse("Not found", userReq.lang));
                }

                if (userId !== message.fromUserId) {
                    return res
                        .status(403)
                        .send(
                            errorResponse(
                                "User can't edit messages that he is not owner",
                                userReq.lang,
                            ),
                        );
                }

                if (message.type !== "text") {
                    return res
                        .status(400)
                        .send(
                            errorResponse(
                                "Only messages with type text can be edited",
                                userReq.lang,
                            ),
                        );
                }

                if (message.isForwarded) {
                    return res
                        .status(400)
                        .send(errorResponse("Forwarded messages can't be edited", userReq.lang));
                }

                const blocked = await isRoomBlocked(message.roomId, userReq.user.id);

                if (blocked) {
                    return res.status(403).send(errorResponse("Room is blocked", userReq.lang));
                }

                for (const deviceMessage of message.deviceMessages) {
                    await prisma.deviceMessage.update({
                        where: { id: deviceMessage.id },
                        data: {
                            modifiedAt: new Date(),
                            body: {
                                ...(deviceMessage.body as Record<string, unknown>),
                                text,
                                thumbnailData: thumbnailData || null,
                            },
                        },
                    });
                }

                message = await prisma.message.update({
                    where: { id },
                    data: { modifiedAt: new Date(), hasLink },
                    include: { deviceMessages: true },
                });

                const userDeviceMessage = message.deviceMessages.find(
                    (dm) => dm.deviceId === deviceId && dm.userId === userId,
                );

                const sanitizedMessage = sanitize({
                    ...message,
                    body: {
                        ...(userDeviceMessage.body as Record<string, unknown>),
                        text,
                        thumbnailData: thumbnailData || null,
                    },
                    createdAt: userDeviceMessage.createdAt,
                    modifiedAt: userDeviceMessage.modifiedAt,
                }).message();

                res.send(successResponse({ message: sanitizedMessage }, userReq.lang));

                while (message.deviceMessages.length) {
                    message.deviceMessages.splice(0, 10).map((deviceMessage) => {
                        rabbitMQChannel.sendToQueue(
                            Constants.QUEUE_SSE,
                            Buffer.from(
                                JSON.stringify({
                                    channelId: deviceMessage.deviceId,
                                    data: {
                                        type: Constants.PUSH_TYPE_UPDATE_MESSAGE,
                                        message: sanitizedMessage,
                                    },
                                }),
                            ),
                        );
                    });
                }
            } catch (e: any) {
                le(e);
                res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
            }
        },
    ];
};
