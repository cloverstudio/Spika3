import { Request, Response, RequestHandler } from "express";

import { UserRequest } from "../../lib/types";
import { error as le } from "../../../../components/logger";

import auth from "../../lib/auth";
import * as yup from "yup";
import validate from "../../../../components/validateMiddleware";
import { successResponse, errorResponse } from "../../../../components/response";
import { MESSAGE_ACTION_NEW_MESSAGE } from "../../../../components/consts";
import * as Constants from "../../../../components/consts";

import { InitRouterParams } from "../../../types/serviceInterface";
import sanitize from "../../../../components/sanitize";
import { formatMessageBody } from "../../../../components/message";
import prisma from "../../../../components/prisma";
import { handleNewMessage } from "../../../../components/agent";
import { getRoomById } from "../room";
import { isRoomBlocked } from "../block";

const forwardMessageBody = yup.object().shape({
    body: yup.object().shape({
        roomsIds: yup.array().default([]).of(yup.number().strict().min(1)),
        usersIds: yup.array().default([]).of(yup.number().strict().min(1)),
        messageId: yup.number().strict().min(1).required(),
    }),
});

export default ({ rabbitMQChannel, redisClient }: InitRouterParams): RequestHandler[] => {
    return [
        auth,
        validate(forwardMessageBody),
        async (req: Request, res: Response) => {
            const userReq: UserRequest = req as UserRequest;

            try {
                const roomsIds: number[] = req.body.roomsIds;
                const usersIds: number[] = req.body.usersIds;
                const messageId: number = req.body.messageId;

                const fromUserId = userReq.user.id;
                const fromDeviceId = userReq.device.id;

                const message = await prisma.message.findUnique({
                    where: {
                        id: messageId,
                    },
                });

                if (!message) {
                    return res.status(404).send(errorResponse("Message not found", userReq.lang));
                }
            } catch (e: unknown) {
                le(e);
                res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
            }
        },
    ];
};
