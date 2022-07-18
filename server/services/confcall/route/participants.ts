import { Router, Request, Response } from "express";
import { PrismaClient, CallHistory, CallSession, Room, Prisma } from "@prisma/client";
const prisma = new PrismaClient();
import amqp from "amqplib";

import { UserRequest } from "../../messenger/lib/types";
import Utils from "../../../components/utils";
import * as consts from "../../../components/consts";
import l, { error as le } from "../../../components/logger";
import { InitRouterParams } from "../../types/serviceInterface";
import { successResponse, errorResponse } from "../../../components/response";
import auth from "../../messenger/lib/auth";
import leaveCallLogic from "../lib/leaveCallLogic";
import notifyRoomUsersLogic from "../lib/notifyRoomUsersLogic";
import sanitize from "../../../components/sanitize";
import * as Constants from "../../../components/consts";

export default (params: InitRouterParams) => {
    const router = Router();
    const rabbitMQChannel: amqp.Channel = params.rabbitMQChannel;

    router.get("/:roomId", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const roomId: number = parseInt((req.params.roomId as string) || "");

        try {
            const room: Room = await prisma.room.findFirst({
                where: {
                    id: roomId,
                },
            });
            if (!room) {
                return res.status(404).send(errorResponse("Not found", userReq.lang));
            }

            const activeCalls = await prisma.callHistory.findMany({
                where: {
                    roomId: roomId,
                    isActive: true,
                },
                include: { user: true },
            });

            const responseData = activeCalls.map((callHistory) => {
                return {
                    user: sanitize(callHistory.user).user(),
                    callParams: callHistory.callParameters,
                };
            });

            res.send(successResponse(responseData, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    return router;
};
