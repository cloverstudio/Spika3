import { RequestHandler, Request, Response } from "express";

import { UserRequest } from "../../lib/types";
import { error as le } from "../../../../components/logger";

import auth from "../../lib/auth";
import { successResponse, errorResponse } from "../../../../components/response";

import { InitRouterParams } from "../../../types/serviceInterface";
import sanitize from "../../../../components/sanitize";
import { formatMessageBody } from "../../../../components/message";
import prisma from "../../../../components/prisma";
import * as Constants from "../../../../components/consts";

export default ({}: InitRouterParams): RequestHandler[] => {
    return [
        auth,
        async (req: Request, res: Response) => {
            const userReq: UserRequest = req as UserRequest;
            const userId = userReq.user.id;
            const deviceId = userReq.device.id;
            const lastUpdate = parseInt(req.params.lastUpdate as string);
            const page = parseInt((req.query.page as string) || "1");

            try {
                if (isNaN(lastUpdate)) {
                    return res
                        .status(400)
                        .send(errorResponse("lastUpdate must be number", userReq.lang));
                }

                if (isNaN(page)) {
                    return res
                        .status(400)
                        .send(errorResponse("page must be valid number", userReq.lang));
                }

                const roomsUser = await prisma.roomUser.findMany({ where: { userId } });
                const roomIds = roomsUser.map((ru) => ru.roomId);

                const newDeviceMessages = await prisma.$queryRaw<
                    { id: number }[]
                >`SELECT \`id\` FROM \`message_device\` WHERE \`user_id\` = ${userId} AND \`device_id\` = ${deviceId} AND \`modified_at\` > ${new Date(
                    lastUpdate,
                ).toISOString()};`;

                const deviceMessageIds = newDeviceMessages.map((m) => m.id);

                const deviceMessages = await prisma.deviceMessage.findMany({
                    where: {
                        id: { in: deviceMessageIds },
                        message: {
                            roomId: { in: roomIds },
                        },
                    },
                    include: {
                        message: true,
                    },
                    take: Constants.SYNC_LIMIT,
                    skip: (page - 1) * Constants.SYNC_LIMIT,
                    orderBy: { modifiedAt: "asc" },
                });

                const count = await prisma.deviceMessage.count({
                    where: {
                        id: { in: deviceMessageIds },
                        message: {
                            roomId: { in: roomIds },
                        },
                    },
                });

                const sanitizedMessages = await Promise.all(
                    deviceMessages.map(async (deviceMessage) => {
                        const m = deviceMessage.message;

                        const { body, deleted } = deviceMessage || {};

                        return sanitize({
                            ...m,
                            body: await formatMessageBody(body, m.type),
                            deleted,
                            createdAt: deviceMessage.createdAt,
                            modifiedAt: deviceMessage.modifiedAt,
                        }).message();
                    }),
                );

                const hasNext = count > page * Constants.SYNC_LIMIT;

                res.send(
                    successResponse(
                        {
                            list: sanitizedMessages,
                            limit: Constants.SYNC_LIMIT,
                            count,
                            hasNext,
                            messages: sanitizedMessages,
                        },
                        userReq.lang,
                    ),
                );
            } catch (e: any) {
                le(e);
                res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
            }
        },
    ];
};
