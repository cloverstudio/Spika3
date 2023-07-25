import { Request, Response, RequestHandler } from "express";

import { UserRequest } from "../../lib/types";
import { error as le } from "../../../../components/logger";

import auth from "../../lib/auth";
import { successResponse, errorResponse } from "../../../../components/response";
import * as Constants from "../../../../components/consts";

import { InitRouterParams } from "../../../types/serviceInterface";
import sanitize from "../../../../components/sanitize";
import prisma from "../../../../components/prisma";

export default ({ rabbitMQChannel }: InitRouterParams): RequestHandler[] => {
    return [
        auth,
        async (req: Request, res: Response) => {
            const userReq: UserRequest = req as UserRequest;
            const userId = userReq.user.id;
            try {
                const id = parseInt((req.params.id as string) || "");
                const target = ((req.query.target as string) || "").toLowerCase();
                const fromUserId = userReq.user.id;
                const fromDeviceId = userReq.device.id;

                if (!target || !["all", "user"].includes(target)) {
                    return res
                        .status(400)
                        .send(errorResponse("Invalid target query param", userReq.lang));
                }

                let message = await prisma.message.findFirst({
                    where: { id },
                    include: { deviceMessages: true },
                });
                if (!message) {
                    return res.status(404).send(errorResponse("Not found", userReq.lang));
                }

                if (target === "all" && message.fromUserId !== userId) {
                    return res
                        .status(403)
                        .send(
                            errorResponse("User can't delete another users message", userReq.lang)
                        );
                }

                const roomUser = await prisma.roomUser.findFirst({
                    where: { roomId: message.roomId },
                });

                if (!roomUser) {
                    return res
                        .status(403)
                        .send(
                            errorResponse(
                                "User can't delete messages from room that he is not in",
                                userReq.lang
                            )
                        );
                }

                const deviceMessagesToDelete =
                    target === "all"
                        ? message.deviceMessages
                        : message.deviceMessages.filter((dm) => dm.userId === userId);

                const newBody = { text: "Deleted message" };

                for (const deviceMessage of deviceMessagesToDelete) {
                    await prisma.deviceMessage.update({
                        where: { id: deviceMessage.id },
                        data: { modifiedAt: new Date(), body: newBody, deleted: true },
                    });
                }

                if (target === "all") {
                    message = await prisma.message.update({
                        where: { id },
                        data: { modifiedAt: new Date(), deleted: true, type: "text" },
                        include: { deviceMessages: true },
                    });
                }

                const userDeviceMessage = await prisma.deviceMessage.findFirst({
                    where: {
                        userId: fromUserId,
                        messageId: message.id,
                        deviceId: fromDeviceId,
                    },
                });

                const sanitizedMessage = sanitize({
                    ...message,
                    body: newBody,
                    deleted: true,
                    createdAt: userDeviceMessage.createdAt,
                    modifiedAt: userDeviceMessage.modifiedAt,
                }).message();

                res.send(successResponse({ message: sanitizedMessage }, userReq.lang));

                while (deviceMessagesToDelete.length) {
                    deviceMessagesToDelete.splice(0, 10).map((deviceMessage) => {
                        rabbitMQChannel.sendToQueue(
                            Constants.QUEUE_SSE,
                            Buffer.from(
                                JSON.stringify({
                                    channelId: deviceMessage.deviceId,
                                    data: {
                                        type: Constants.PUSH_TYPE_DELETE_MESSAGE,
                                        message: sanitizedMessage,
                                    },
                                })
                            )
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
