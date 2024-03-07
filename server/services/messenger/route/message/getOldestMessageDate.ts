import { Request, Response, RequestHandler } from "express";
import { UserRequest } from "../../lib/types";
import { error as le } from "../../../../components/logger";
import auth from "../../lib/auth";
import { successResponse, errorResponse } from "../../../../components/response";
import { InitRouterParams } from "../../../types/serviceInterface";
import prisma from "../../../../components/prisma";
import { getRoomById } from "../room";

export default ({ redisClient }: InitRouterParams): RequestHandler[] => {
    // only web should call this route
    return [
        auth,
        async (req: Request, res: Response) => {
            const userReq: UserRequest = req as UserRequest;
            const userId = userReq.user.id;
            const roomId = +((req.params.roomId as string) || "");

            try {
                const room = await getRoomById(roomId, redisClient);

                if (!room) {
                    return res.status(404).send(errorResponse("No room found", userReq.lang));
                }

                const roomUser = room.users.find((u) => u.userId === userId);

                if (!roomUser) {
                    return res.status(404).send(errorResponse("No room found", userReq.lang));
                }

                const firstMessage = await prisma.message.findFirst({
                    where: {
                        roomId,
                    },
                    orderBy: {
                        createdAt: "asc",
                    },
                    select: {
                        createdAt: true,
                    },
                });

                res.send(
                    successResponse(
                        {
                            messageDate: firstMessage?.createdAt || null,
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

function isToday(inputDate: Date) {
    const today = new Date();
    return (
        inputDate.getFullYear() === today.getFullYear() &&
        inputDate.getMonth() === today.getMonth() &&
        inputDate.getDate() === today.getDate()
    );
}
