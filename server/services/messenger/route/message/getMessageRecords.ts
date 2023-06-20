import { Request, Response, RequestHandler } from "express";

import { UserRequest } from "../../lib/types";
import { error as le } from "../../../../components/logger";

import auth from "../../lib/auth";
import { successResponse, errorResponse } from "../../../../components/response";

import { InitRouterParams } from "../../../types/serviceInterface";
import sanitize from "../../../../components/sanitize";
import prisma from "../../../../components/prisma";

export default ({}: InitRouterParams): RequestHandler[] => {
    return [
        auth,
        async (req: Request, res: Response) => {
            const userReq: UserRequest = req as UserRequest;
            const userId = userReq.user.id;

            try {
                const id = parseInt(req.params.id as string);

                const message = await prisma.message.findUnique({
                    where: { id },
                    include: { messageRecords: true },
                });

                if (!message) {
                    return res.status(404).send(errorResponse("No message found", userReq.lang));
                }

                const roomUser = await prisma.roomUser.findFirst({
                    where: { roomId: message.roomId, userId },
                });

                if (!roomUser) {
                    return res.status(404).send(errorResponse("No message found", userReq.lang));
                }

                res.send(
                    successResponse(
                        {
                            messageRecords: message.messageRecords.map((record) =>
                                sanitize({ ...record, roomId: message.roomId }).messageRecord()
                            ),
                        },
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
