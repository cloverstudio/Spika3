import { Router, Request, Response } from "express";
import { CallHistory, CallSession, Room, Prisma } from "@prisma/client";
import amqp from "amqplib";

import { UserRequest } from "../../messenger/lib/types";
import l, { error as le } from "../../../components/logger";
import { InitRouterParams } from "../../types/serviceInterface";
import { successResponse, errorResponse } from "../../../components/response";
import auth from "../../messenger/lib/auth";
import notifyRoomUsersLogic from "../lib/notifyRoomUsersLogic";
import * as Constants from "../../../components/consts";
import mediasoupHandler, { CallParamsInDB } from "../lib/mediasoupHandler";
import prisma from "../../../components/prisma";

// handle and save all mediasoup variables here

export default (params: InitRouterParams) => {
    const router = Router();
    const rabbitMQChannel: amqp.Channel = params.rabbitMQChannel;

    router.get("/:roomId/join", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const roomId: number = parseInt((req.params.roomId as string) || "");

        try {
            const room: Room = await prisma.room.findFirst({
                where: {
                    id: roomId,
                },
            });
            if (!room) {
                le(`room not found ${roomId}`);
                return res.status(404).send(errorResponse("Not found", userReq.lang));
            }

            // check existing session
            const callSession: CallSession = await prisma.callSession.findFirst({
                where: {
                    roomId: roomId,
                    isActive: true,
                },
            });
            if (!callSession) {
                le(`no active session ${roomId}`);
                return res.status(404).send(errorResponse("Not active session", userReq.lang));
            }

            const { peerId, transportParams, rtpCapabilities } = await mediasoupHandler.join(
                roomId,
                userReq.user
            );

            res.send(
                successResponse(
                    {
                        peerId,
                        transportParams,
                        rtpCapabilities,
                    },
                    userReq.lang
                )
            );
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.get("/:roomId/leave", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const roomId: number = parseInt((req.params.roomId as string) || "");

        try {
            const room: Room = await prisma.room.findFirst({
                where: {
                    id: roomId,
                },
            });
            if (!room) {
                le(`room not found ${roomId}`);
                return res.status(404).send(errorResponse("Not found", userReq.lang));
            }

            await mediasoupHandler.leave(roomId, userReq.user);

            res.send(successResponse({}));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.post("/:roomId/transportConnect", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const roomId: number = parseInt((req.params.roomId as string) || "");
        const peerId: string = req.body.peerId;
        const dtlsParameters: any = req.body.dtlsParameters;

        if (!peerId) {
            le(`Invalid peerId ${peerId}`);
            return res.status(400).send(errorResponse("Invalid peerId", userReq.lang));
        }

        if (!dtlsParameters)
            return res.status(400).send(errorResponse("Invalid dtlsParameters", userReq.lang));

        try {
            const room: Room = await prisma.room.findFirst({
                where: {
                    id: roomId,
                },
            });
            if (!room) {
                le(`room not found ${roomId}`);
                return res.status(404).send(errorResponse("Not found", userReq.lang));
            }

            // check existing session
            const callSession: CallSession = await prisma.callSession.findFirst({
                where: {
                    roomId: roomId,
                    isActive: true,
                },
            });
            if (!callSession) {
                le(`no active session ${roomId}`);
                return res.status(404).send(errorResponse("Not active session", userReq.lang));
            }

            await mediasoupHandler.transportConnect(roomId, peerId, dtlsParameters);

            res.send(successResponse({}, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.post("/:roomId/transportProduce", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const roomId: number = parseInt((req.params.roomId as string) || "");
        const userId: number = userReq.user.id;
        const peerId: string = req.body.peerId;
        const rtpParameters: any = req.body.rtpParameters;
        const appData: any = req.body.appData;
        const kind: "audio" | "video" = req.body.kind;

        if (!peerId) {
            le(`Invalid peerId ${peerId}`);
            return res.status(400).send(errorResponse("Invalid peerId", userReq.lang));
        }
        if (!rtpParameters)
            return res.status(400).send(errorResponse("Invalid rtpParameters", userReq.lang));

        if (!kind)
            return res
                .status(400)
                .send(errorResponse("Invalid params, kind needed.", userReq.lang));

        try {
            const room: Room = await prisma.room.findFirst({
                where: {
                    id: roomId,
                },
            });
            if (!room) {
                le(`room not found ${roomId}`);
                return res.status(404).send(errorResponse("Not found", userReq.lang));
            }

            // check existing session
            const callSession: CallSession = await prisma.callSession.findFirst({
                where: {
                    roomId: roomId,
                    isActive: true,
                },
            });
            if (!callSession) {
                le(`no active session ${roomId}`);
                return res.status(404).send(errorResponse("Not active session", userReq.lang));
            }

            // get history
            const callHistory: CallHistory = await prisma.callHistory.findFirst({
                where: {
                    userId: userId,
                    sessionId: callSession.id,
                    isActive: true,
                    leftAt: null,
                },
                orderBy: {
                    joinedAt: "desc",
                },
            });
            if (!callHistory)
                return res.status(404).send(errorResponse("Not active calllog", userReq.lang));

            const producerId = await mediasoupHandler.produce(
                roomId,
                peerId,
                kind,
                rtpParameters,
                appData
            );

            const callParams: CallParamsInDB = (callHistory.callParameters as CallParamsInDB) ?? {
                videoProducerId: "",
                audioProducerId: "",
                screenshareProducerId: "",
                videoEnabled: true,
                audioEnabled: true,
            };

            kind === "video" && appData?.kind === "screenshare"
                ? (callParams.screenshareProducerId = producerId)
                : null;

            kind === "video" && appData?.kind !== "screenshare"
                ? (callParams.videoProducerId = producerId)
                : null;
            kind === "audio" ? (callParams.audioProducerId = producerId) : null;

            await prisma.callHistory.update({
                where: {
                    id: callHistory.id,
                },
                data: {
                    callParameters: callParams,
                },
            });

            await notifyRoomUsersLogic(roomId, rabbitMQChannel, {
                type: Constants.PUSH_TYPE_CALL_UPDATE,
            });

            res.send(
                successResponse(
                    {
                        producerId: producerId,
                    },
                    userReq.lang
                )
            );
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.post("/:roomId/receiveTransport", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const roomId: number = parseInt((req.params.roomId as string) || "");
        const userId: number = userReq.user.id;
        const peerId: string = req.body.peerId;

        if (!peerId) {
            le(`Invalid peerId ${peerId}`);
            return res.status(400).send(errorResponse("Invalid peerId", userReq.lang));
        }

        try {
            const room: Room = await prisma.room.findFirst({
                where: {
                    id: roomId,
                },
            });
            if (!room) {
                le(`room not found ${roomId}`);
                return res.status(404).send(errorResponse("Not found", userReq.lang));
            }

            // check existing session
            const callSession: CallSession = await prisma.callSession.findFirst({
                where: {
                    roomId: roomId,
                    isActive: true,
                },
            });
            if (!callSession) {
                le(`no active session ${roomId}`);
                return res.status(404).send(errorResponse("Not active session", userReq.lang));
            }

            // get history
            const callHistory: CallHistory = await prisma.callHistory.findFirst({
                where: {
                    userId: userId,
                    sessionId: callSession.id,
                    isActive: true,
                    leftAt: null,
                },
                orderBy: {
                    joinedAt: "desc",
                },
            });
            if (!callHistory)
                return res.status(404).send(errorResponse("Not active calllog", userReq.lang));

            const transport = await mediasoupHandler.newConsumerTransport(roomId, peerId);

            res.send(
                successResponse(
                    {
                        id: transport.id,
                        iceParameters: transport.iceParameters,
                        iceCandidates: transport.iceCandidates,
                        dtlsParameters: transport.dtlsParameters,
                    },
                    userReq.lang
                )
            );
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.post("/:roomId/receiverConnected", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const roomId: number = parseInt((req.params.roomId as string) || "");
        const userId: number = userReq.user.id;
        const peerId: string = req.body.peerId;
        const dtlsParameters: any = req.body.dtlsParameters;

        if (!peerId) {
            le(`Invalid peerId ${peerId}`);
            return res.status(400).send(errorResponse("Invalid peerId", userReq.lang));
        }
        if (!dtlsParameters)
            return res.status(400).send(errorResponse("Invalid dtlsParameters", userReq.lang));

        try {
            const room: Room = await prisma.room.findFirst({
                where: {
                    id: roomId,
                },
            });
            if (!room) {
                le(`room not found ${roomId}`);
                return res.status(404).send(errorResponse("Not found", userReq.lang));
            }

            // check existing session
            const callSession: CallSession = await prisma.callSession.findFirst({
                where: {
                    roomId: roomId,
                    isActive: true,
                },
            });
            if (!callSession) {
                le(`no active session ${roomId}`);
                return res.status(404).send(errorResponse("Not active session", userReq.lang));
            }

            // get history
            const callHistory: CallHistory = await prisma.callHistory.findFirst({
                where: {
                    userId: userId,
                    sessionId: callSession.id,
                    isActive: true,
                    leftAt: null,
                },
                orderBy: {
                    joinedAt: "desc",
                },
            });
            if (!callHistory)
                return res.status(404).send(errorResponse("Not active calllog", userReq.lang));

            const transport = await mediasoupHandler.consumerTransportConnect(
                roomId,
                peerId,
                dtlsParameters
            );

            res.send(successResponse({}, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.post("/:roomId/startConsuming", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const roomId: number = parseInt((req.params.roomId as string) || "");
        const userId: number = userReq.user.id;
        const peerId: string = req.body.peerId;
        const rtpCapabilities: any = req.body.rtpCapabilities;
        const producerId: any = req.body.producerId;
        const kind: any = req.body.kind;

        if (!peerId) {
            le(`Invalid peerId ${peerId}`);
            return res.status(400).send(errorResponse("Invalid peerId", userReq.lang));
        }
        if (!rtpCapabilities)
            return res.status(400).send(errorResponse("Invalid rtpCapabilities", userReq.lang));
        if (!producerId)
            return res.status(400).send(errorResponse("Invalid producerId", userReq.lang));
        if (!kind) return res.status(400).send(errorResponse("Invalid kind", userReq.lang));

        try {
            const room: Room = await prisma.room.findFirst({
                where: {
                    id: roomId,
                },
            });
            if (!room) {
                le(`room not found ${roomId}`);
                return res.status(404).send(errorResponse("Not found", userReq.lang));
            }

            // check existing session
            const callSession: CallSession = await prisma.callSession.findFirst({
                where: {
                    roomId: roomId,
                    isActive: true,
                },
            });
            if (!callSession) {
                le(`no active session ${roomId}`);
                return res.status(404).send(errorResponse("Not active session", userReq.lang));
            }

            // get history
            const callHistory: CallHistory = await prisma.callHistory.findFirst({
                where: {
                    userId: userId,
                    sessionId: callSession.id,
                    isActive: true,
                    leftAt: null,
                },
                orderBy: {
                    joinedAt: "desc",
                },
            });
            if (!callHistory)
                return res.status(404).send(errorResponse("Not active calllog", userReq.lang));

            const consumer = await mediasoupHandler.startConsuming(
                roomId,
                peerId,
                producerId,
                kind,
                rtpCapabilities
            );

            res.send(
                successResponse(
                    {
                        id: consumer.id,
                        producerId: producerId,
                        kind: consumer.kind,
                        rtpParameters: consumer.rtpParameters,
                    },
                    userReq.lang
                )
            );
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.post("/:roomId/pause", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const roomId: number = parseInt((req.params.roomId as string) || "");
        const userId: number = userReq.user.id;
        const peerId: string = req.body.peerId;
        const kind: "video" | "audio" = req.body.kind;

        if (!peerId) {
            le(`Invalid peerId ${peerId}`);
            return res.status(400).send(errorResponse("Invalid peerId", userReq.lang));
        }
        if (!kind) return res.status(400).send(errorResponse("Invalid kind", userReq.lang));

        if (kind !== "video" && kind !== "audio")
            return res.status(400).send(errorResponse("Invalid kind", userReq.lang));

        try {
            const room: Room = await prisma.room.findFirst({
                where: {
                    id: roomId,
                },
            });
            if (!room) {
                le(`room not found ${roomId}`);
                return res.status(404).send(errorResponse("Not found", userReq.lang));
            }

            // check existing session
            const callSession: CallSession = await prisma.callSession.findFirst({
                where: {
                    roomId: roomId,
                    isActive: true,
                },
            });
            if (!callSession) {
                le(`no active session ${roomId}`);
                return res.status(404).send(errorResponse("Not active session", userReq.lang));
            }

            // get history
            const callHistory: CallHistory = await prisma.callHistory.findFirst({
                where: {
                    userId: userId,
                    sessionId: callSession.id,
                    isActive: true,
                    leftAt: null,
                },
                orderBy: {
                    joinedAt: "desc",
                },
            });
            if (!callHistory)
                return res.status(404).send(errorResponse("Not active calllog", userReq.lang));

            await mediasoupHandler.pause(roomId, peerId, kind);

            const callParams: CallParamsInDB = callHistory.callParameters as CallParamsInDB;
            if (kind === "video") callParams.videoEnabled = false;
            else callParams.audioEnabled = false;

            await prisma.callHistory.update({
                where: {
                    id: callHistory.id,
                },
                data: {
                    callParameters: callParams,
                },
            });

            await notifyRoomUsersLogic(roomId, rabbitMQChannel, {
                type: Constants.PUSH_TYPE_CALL_UPDATE,
            });

            res.send(successResponse({}, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.post("/:roomId/resume", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const roomId: number = parseInt((req.params.roomId as string) || "");
        const userId: number = userReq.user.id;
        const peerId: string = req.body.peerId;
        const kind: "video" | "audio" = req.body.kind;

        if (!peerId) {
            le(`Invalid peerId ${peerId}`);
            return res.status(400).send(errorResponse("Invalid peerId", userReq.lang));
        }
        if (!kind) return res.status(400).send(errorResponse("Invalid kind", userReq.lang));

        if (kind !== "video" && kind !== "audio")
            return res.status(400).send(errorResponse("Invalid kind", userReq.lang));

        try {
            const room: Room = await prisma.room.findFirst({
                where: {
                    id: roomId,
                },
            });
            if (!room) {
                le(`room not found ${roomId}`);
                return res.status(404).send(errorResponse("Not found", userReq.lang));
            }

            // check existing session
            const callSession: CallSession = await prisma.callSession.findFirst({
                where: {
                    roomId: roomId,
                    isActive: true,
                },
            });
            if (!callSession) {
                le(`no active session ${roomId}`);
                return res.status(404).send(errorResponse("Not active session", userReq.lang));
            }

            // get history
            const callHistory: CallHistory = await prisma.callHistory.findFirst({
                where: {
                    userId: userId,
                    sessionId: callSession.id,
                    isActive: true,
                    leftAt: null,
                },
                orderBy: {
                    joinedAt: "desc",
                },
            });
            if (!callHistory)
                return res.status(404).send(errorResponse("Not active calllog", userReq.lang));

            await mediasoupHandler.resume(roomId, peerId, kind);

            const callParams: CallParamsInDB = callHistory.callParameters as CallParamsInDB;
            if (kind === "video") callParams.videoEnabled = true;
            else callParams.audioEnabled = true;

            await prisma.callHistory.update({
                where: {
                    id: callHistory.id,
                },
                data: {
                    callParameters: callParams,
                },
            });

            await notifyRoomUsersLogic(roomId, rabbitMQChannel, {
                type: Constants.PUSH_TYPE_CALL_UPDATE,
            });

            res.send(successResponse({}, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.post("/:roomId/stopScreenshare", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const roomId: number = parseInt((req.params.roomId as string) || "");
        const userId: number = userReq.user.id;
        const peerId: string = req.body.peerId;

        if (!peerId) {
            le(`Invalid peerId ${peerId}`);
            return res.status(400).send(errorResponse("Invalid peerId", userReq.lang));
        }

        try {
            const room: Room = await prisma.room.findFirst({
                where: {
                    id: roomId,
                },
            });
            if (!room) {
                le(`room not found ${roomId}`);
                return res.status(404).send(errorResponse("Not found", userReq.lang));
            }

            // check existing session
            const callSession: CallSession = await prisma.callSession.findFirst({
                where: {
                    roomId: roomId,
                    isActive: true,
                },
            });
            if (!callSession) {
                le(`no active session ${roomId}`);
                return res.status(404).send(errorResponse("Not active session", userReq.lang));
            }

            // get history
            const callHistory: CallHistory = await prisma.callHistory.findFirst({
                where: {
                    userId: userId,
                    sessionId: callSession.id,
                    isActive: true,
                    leftAt: null,
                },
                orderBy: {
                    joinedAt: "desc",
                },
            });
            if (!callHistory)
                return res.status(404).send(errorResponse("Not active calllog", userReq.lang));

            await mediasoupHandler.stopScreenshare(roomId, peerId);

            const callParams: CallParamsInDB = callHistory.callParameters as CallParamsInDB;
            callParams.screenshareProducerId = "";

            await prisma.callHistory.update({
                where: {
                    id: callHistory.id,
                },
                data: {
                    callParameters: callParams,
                },
            });

            await notifyRoomUsersLogic(roomId, rabbitMQChannel, {
                type: Constants.PUSH_TYPE_CALL_UPDATE,
            });

            res.send(successResponse({}, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    return router;
};
