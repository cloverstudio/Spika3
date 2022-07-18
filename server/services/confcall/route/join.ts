import { Router, Request, Response } from "express";
import { PrismaClient, Room, CallSession } from "@prisma/client";
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

    router.post("/:roomId/join", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const roomId: number = parseInt((req.params.roomId as string) || "");
        const videoEnabled: number = parseInt((req.body.videoEnabled as string) || "0");
        const audioEnabled: number = parseInt((req.body.audioEnabled as string) || "0");

        try {
            const room: Room = await prisma.room.findFirst({
                where: {
                    id: roomId,
                },
            });
            if (!room) {
                return res.status(404).send(errorResponse("Not found", userReq.lang));
            }

            await notifyRoomUsersLogic(roomId, rabbitMQChannel, {
                type: Constants.PUSH_TYPE_CALL_JOIN,
                user: sanitize(userReq.user).user(),
            });

            let sessionId: number = 0;
            let isInitiator: boolean = false;

            // check existing session
            const callSession: CallSession = await prisma.callSession.findFirst({
                where: {
                    roomId: roomId,
                    isActive: true,
                },
            });

            if (!callSession) {
                const newCallSession = await prisma.callSession.create({
                    data: {
                        roomId: roomId,
                        isActive: true,
                        staredAt: new Date(),
                        finishedAt: null,
                    },
                });

                sessionId = newCallSession.id;
                isInitiator = true;
            } else sessionId = callSession.id;

            // insert to history
            await prisma.callHistory.create({
                data: {
                    sessionId: sessionId,
                    userId: userReq.user.id,
                    roomId: roomId,
                    isActive: true,
                    isInitiator: isInitiator,
                    joinedAt: new Date(),
                    leftAt: null,
                    callParameters: {
                        videoEnabled: videoEnabled === 1 ? true : false,
                        audioEnabled: audioEnabled === 1 ? true : false,
                        videoProducerId: "",
                        audioProduverId: "",
                    },
                },
            });

            res.send(successResponse({}));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.post("/:roomId/leave", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const roomId = parseInt((req.params.roomId as string) || "");

        try {
            const room: Room = await prisma.room.findFirst({
                where: {
                    id: roomId,
                },
            });
            if (!room) {
                return res.status(404).send(errorResponse("Not found", userReq.lang));
            }

            // SSE is called in leave logic
            await leaveCallLogic(userReq.user.id, roomId, rabbitMQChannel);

            res.send(successResponse({}));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    return router;
};
