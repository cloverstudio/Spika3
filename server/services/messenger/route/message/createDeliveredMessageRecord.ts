import { Request, Response, RequestHandler } from "express";
import { MessageRecord } from "@prisma/client";

import { UserRequest } from "../../lib/types";
import { error as le } from "../../../../components/logger";

import auth from "../../lib/auth";
import * as yup from "yup";
import validate from "../../../../components/validateMiddleware";
import { successResponse, errorResponse } from "../../../../components/response";
import * as Constants from "../../../../components/consts";

import { InitRouterParams } from "../../../types/serviceInterface";
import createSSEMessageRecordsNotify from "../../lib/sseMessageRecordsNotify";
import prisma from "../../../../components/prisma";

const deliveredMessagesSchema = yup.object().shape({
    body: yup.object().shape({
        messageIds: yup.array().default([]).of(yup.number().strict().moreThan(0)).required(),
    }),
});

export default ({ rabbitMQChannel }: InitRouterParams): RequestHandler[] => {
    const sseMessageRecordsNotify = createSSEMessageRecordsNotify(rabbitMQChannel);

    return [
        auth,
        validate(deliveredMessagesSchema),
        async (req: Request, res: Response) => {
            const userReq: UserRequest = req as UserRequest;
            const userId = userReq.user.id;
            const messageIds = req.body.messageIds as number[];

            try {
                const messages = await prisma.message.findMany({
                    where: { id: { in: messageIds } },
                    include: { messageRecords: true },
                });

                if (!messages.length) {
                    return res
                        .status(400)
                        .send(errorResponse("No messages with given ids found", userReq.lang));
                }

                const notFoundMessageIds = messageIds.filter(
                    (id) => !messages.find((m) => m.id === id),
                );

                if (notFoundMessageIds.length) {
                    return res
                        .status(400)
                        .send(
                            errorResponse(
                                `Messages with ids: ${notFoundMessageIds.join(",")} not found`,
                                userReq.lang,
                            ),
                        );
                }

                const roomIds = messages
                    .map((m) => m.roomId)
                    .filter((item, index, self) => self.indexOf(item) === index);

                const roomsUser = await prisma.roomUser.findMany({
                    where: { roomId: { in: roomIds }, userId },
                });

                const notFoundRomsUser = roomIds.filter(
                    (roomId) => !roomsUser.find((m) => m.roomId === roomId),
                );

                if (notFoundRomsUser.length) {
                    return res
                        .status(400)
                        .send(
                            errorResponse(
                                "One or more message is from room that user is not part of",
                                userReq.lang,
                            ),
                        );
                }

                const messageRecords: Partial<
                    Omit<MessageRecord, "createdAt" | "modifiedAt"> & {
                        createdAt: number;
                    }
                >[] = [];

                const messageRecordsNotifyData = {
                    types: ["delivered"],
                    userId,
                    messageIds: messages.map((m) => m.id),
                    pushType: Constants.PUSH_TYPE_NEW_MESSAGE_RECORD,
                };

                sseMessageRecordsNotify(messageRecordsNotifyData);

                res.send(successResponse({ messageRecords }, userReq.lang));
            } catch (e: any) {
                le(e);
                res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
            }
        },
    ];
};
