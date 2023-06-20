import { RequestHandler, Request, Response } from "express";
import { DeviceMessage, Message } from "@prisma/client";

import { UserRequest } from "../../lib/types";
import { error as le } from "../../../../components/logger";

import auth from "../../lib/auth";
import { successResponse, errorResponse } from "../../../../components/response";

import { InitRouterParams } from "../../../types/serviceInterface";
import sanitize from "../../../../components/sanitize";
import { formatMessageBody } from "../../../../components/message";
import prisma from "../../../../components/prisma";

export default ({}: InitRouterParams): RequestHandler[] => {
    return [
        auth,
        async (req: Request, res: Response) => {
            const userReq: UserRequest = req as UserRequest;
            const userId = userReq.user.id;
            const deviceId = userReq.device.id;
            const lastUpdate = parseInt(req.params.lastUpdate as string);

            try {
                if (isNaN(lastUpdate)) {
                    return res
                        .status(400)
                        .send(errorResponse("lastUpdate must be number", userReq.lang));
                }

                const roomsUser = await prisma.roomUser.findMany({ where: { userId } });
                const roomsIds = roomsUser.map((ru) => ru.roomId);

                const messages = await prisma.message.findMany({
                    where: {
                        modifiedAt: { gt: new Date(lastUpdate) },
                        roomId: { in: roomsIds },
                        deviceMessages: {
                            some: {
                                deviceId,
                            },
                        },
                    },
                    include: {
                        deviceMessages: true,
                    },
                });

                const deviceMessages = await prisma.deviceMessage.findMany({
                    where: {
                        deviceId,
                        modifiedAt: { gt: new Date(lastUpdate) },
                    },
                    include: { message: true },
                });

                const dMessages = deviceMessages.reduce((acc, dm) => {
                    const { message } = dm;
                    if (!message) {
                        return acc;
                    }

                    if (messages.find((m) => m.id === message.id)) {
                        return acc;
                    }

                    const { id } = message;
                    const messageIndex = acc.findIndex((m) => m.id === id);
                    if (messageIndex === -1) {
                        acc.push({
                            ...message,
                            deviceMessages: [dm],
                        });
                    } else {
                        acc[messageIndex].deviceMessages.push(dm);
                    }

                    return acc;
                }, [] as (Message & { deviceMessages: DeviceMessage[] })[]);

                const sanitizedMessages = await Promise.all(
                    [...messages, ...dMessages]
                        .filter((m) => +m.createdAt !== +m.modifiedAt)
                        .map(async (m) => {
                            const deviceMessage = m.deviceMessages.find(
                                (dm) => dm.messageId === m.id && dm.deviceId === deviceId
                            );

                            const { body, deleted } = deviceMessage || {};

                            return sanitize({
                                ...m,
                                body: await formatMessageBody(body, m.type),
                                deleted,
                            }).message();
                        })
                );

                res.send(successResponse({ messages: sanitizedMessages }, userReq.lang));
            } catch (e: any) {
                le(e);
                res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
            }
        },
    ];
};
