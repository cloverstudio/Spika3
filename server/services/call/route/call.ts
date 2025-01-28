import { Router, Request, Response } from "express";
import amqp from "amqplib";

import { UserRequest } from "../../messenger/lib/types";
import { error as le } from "../../../components/logger";
import { InitRouterParams } from "../../types/serviceInterface";
import { successResponse, errorResponse } from "../../../components/response";
import auth from "../../messenger/lib/auth";
import * as Constants from "../../../components/consts";
import prisma from "../../../components/prisma";
import { Room } from "@prisma/client";
import { isRoomBlocked } from "../../messenger/route/block";
import sanitize from "../../../components/sanitize";

export default (params: InitRouterParams) => {
    const router = Router();
    const rabbitMQChannel: amqp.Channel = params.rabbitMQChannel;

    /**
     * @api {post} /api/call/:eventType Respond to call event
     * @apiName Respond to call event
     * @apiGroup Event
     * @apiVersion 1.0.0
     *
     * @apiDescription This endpoint is used to respond to the call event. Stop should be called when the user wants to stop CALLING (for example. user waits long time for other participant to respond and decide to stop calling). Start should be called when the user wants to start the calling. Accept should be called when the user wants to accept the call. Reject should be called when the user wants to reject the call.
     *
     * @apiBody {String} roomId Id of the room for which the user accepts the call.
     *
     * @apiParam {String} eventType The type of event to be triggered. One of the following: start, accept, reject, stop.
     *
     * @apiSuccessExample {json} Success-Response:
     *  HTTP/1.1 200 OK
     *  {
     *      "status": "success",
     *      "data": "Call accepted"
     *  }
     *
     * @apiSuccessExample {json} Success-Response:
     *  HTTP/1.1 200 OK
     *  {
     *      "status": "success",
     *      "data": "Call rejected"
     *  }
     *
     * @apiSuccessExample {json} Success-Response:
     *  HTTP/1.1 200 OK
     *  {
     *      "status": "success",
     *      "data": "Call stopped"
     *  }
     *
     * @apiSuccessExample {json} Success-Response:
     *  HTTP/1.1 200 OK
     *  {
     *      "status": "success",
     *      "data": "Call started"
     *  }
     *
     * @apiErrorExample {json} Error-Response:
     *  HTTP/1.1 404 Not Found
     *  {
     *      "status": "error",
     *      "message": "Room not found"
     *  }
     *
     * @apiErrorExample {json} Error-Response:
     *  HTTP/1.1 400 Bad request
     *  {
     *      "status": "error",
     *      "message": "Invalid event typed"
     *  }
     *
     */

    router.post("/start", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const roomId: number = parseInt((req.body.roomId as string) || "");

        try {
            const room: Room = await prisma.room.findFirst({
                where: {
                    id: roomId,
                },
            });
            if (!room) {
                return res.status(404).send(errorResponse("Room not found"));
            }

            const userIds = await prisma.roomUser.findMany({
                where: {
                    roomId,
                    userId: {
                        not: userReq.user.id,
                    },
                },
                select: {
                    userId: true,
                },
            });


            const userBlocked = await prisma.block.findFirst({
                where: { userId: userIds[0].userId, blockedId: userReq.user.id },
            });

            const roomBlocked = await isRoomBlocked(room.id, userReq.user.id);

            if (userBlocked || roomBlocked) {
                //return res.status(403).send(errorResponse(req.i18n.t("callCannotBeEstablished")));
                return res.status(403).send(errorResponse("Call cannot be established"));
            }

            const ongoingCall = await prisma.call.findFirst({
                where: { roomId, finishedAt: null },
            });

            if (ongoingCall) {
                return res.status(400).send(errorResponse("A call is already ongoing in this room"));
            }

            const call = await prisma.call.create({
                data: {
                    roomId,
                    startedAt: new Date(),
                },
            });

            await prisma.callParticipant.create({
                data: {
                    callId: call.id,
                    userId: userReq.user.id,
                    isInitiator: true,
                    joinedAt: new Date(),
                },
            });

            const isGroup = room.type === "group";

            if (isGroup) {
                const message = await prisma.message.create({
                    data: {
                        type: Constants.SYSTEM_MESSAGE_TYPE,
                        roomId: room.id,
                        fromUserId: userReq.user.id,
                        totalUserCount: 0,
                        deliveredCount: 0,
                        seenCount: 0,
                    },
                });

                const roomUser = await prisma.roomUser.findFirst({
                    where: {
                        roomId: room.id,
                        userId: userReq.user.id
                    },
                    include: {
                        room: {
                            include: {
                                users: true
                            }
                        }
                    }
                })

                const sanitizedMessage = sanitize({
                    ...message,
                    body: {
                        text: `${userReq.user.displayName} initiated call`,
                        user: userReq.user.displayName,
                        userId: userReq.user.id,
                        type: Constants.SYSTEM_MESSAGE_TYPE_INITIATE_CALL,
                        room: room.name,
                        roomId: room.id,
                        callId: call.id,
                        isOngoing: true
                    },
                }).message();

                rabbitMQChannel.sendToQueue(
                    Constants.QUEUE_MESSAGES_SSE,
                    Buffer.from(
                        JSON.stringify({
                            room: roomUser.room,
                            message: sanitizedMessage,
                        }),
                    ),
                );
            }

            const deviceIds = await prisma.device.findMany({
                where: {
                    userId: { in: userIds.map((obj) => obj.userId) },
                },
                select: {
                    id: true,
                },
            });

            deviceIds.forEach((obj) => {
                const deviceId = obj.id;

                rabbitMQChannel.sendToQueue(
                    Constants.QUEUE_SSE,
                    Buffer.from(
                        JSON.stringify({
                            channelId: deviceId,
                            data: {
                                type: Constants.START_CALL,
                                roomId: room.id,
                                roomType: room.type,
                                displayName: isGroup ? room.name : userReq.user.displayName,
                                avatarFileId: isGroup ? room.avatarFileId : userReq.user.avatarFileId,
                                initiator: userReq.user.displayName,

                            },
                        }),
                    ),
                );
            });

            res.send(successResponse("Call started"));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`));
        }
    });

    router.post("/stop", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const roomId: number = parseInt((req.body.roomId as string) || "");

        try {
            const room: Room = await prisma.room.findFirst({
                where: {
                    id: roomId,
                },
            });
            if (!room) {
                return res.status(404).send(errorResponse("Room not found"));
            }

            const call = await prisma.call.findFirst({
                where: { roomId, finishedAt: null },
            });

            if (!call) {
                return res.status(404).send(errorResponse("No ongoing call found in this room"));
            }

            await prisma.call.update({
                where: { id: call.id },
                data: {
                    finishedAt: new Date(),
                },
            });

            await prisma.callParticipant.update({
                where: {
                    call_user_unique: {
                        callId: call.id,
                        userId: userReq.user.id,
                    },
                },
                data: {
                    leftAt: new Date(),
                },
            });

            const isGroup = room.type === "group";

            if (isGroup) {
                const deviceMessages = await prisma.deviceMessage.findMany({
                    where: {
                        message: {
                            roomId: roomId,
                            type: "system"
                        },
                        body: {
                            path: "$.type",
                            equals: Constants.SYSTEM_MESSAGE_TYPE_INITIATE_CALL,
                        },
                        AND: [
                            {
                                body: {
                                    path: "$.isOngoing",
                                    equals: true,
                                },
                            },
                        ],
                    },
                })

                for (const deviceMessage of deviceMessages) {
                    await prisma.deviceMessage.update({
                        where: { id: deviceMessage.id },
                        data: {
                            modifiedAt: new Date(),
                            body: {
                                ...(deviceMessage.body as Record<string, unknown>),
                                isOngoing: false
                            },
                        },
                    });
                }

                const message = await prisma.message.create({
                    data: {
                        type: Constants.SYSTEM_MESSAGE_TYPE,
                        roomId: room.id,
                        fromUserId: userReq.user.id,
                        totalUserCount: 0,
                        deliveredCount: 0,
                        seenCount: 0,
                    },
                });

                const roomUser = await prisma.roomUser.findFirst({
                    where: {
                        roomId: room.id,
                        userId: userReq.user.id
                    },
                    include: {
                        room: {
                            include: {
                                users: true
                            }
                        }
                    }
                })

                const sanitizedMessage = sanitize({
                    ...message,
                    body: {
                        text: "stopped call",
                        user: userReq.user.displayName,
                        userId: userReq.user.id,
                        type: Constants.SYSTEM_MESSAGE_TYPE_END_CALL,
                        room: room.name,
                        roomId: room.id,
                    },
                }).message();

                rabbitMQChannel.sendToQueue(
                    Constants.QUEUE_MESSAGES_SSE,
                    Buffer.from(
                        JSON.stringify({
                            room: roomUser.room,
                            message: sanitizedMessage,
                        }),
                    ),
                );
            }

            const userIds = await prisma.roomUser.findMany({
                where: {
                    roomId,
                    userId: {
                        not: userReq.user.id,
                    },
                },
                select: {
                    userId: true,
                },
            });

            const deviceIds = await prisma.device.findMany({
                where: {
                    userId: { in: userIds.map((obj) => obj.userId) },
                },
                select: {
                    id: true,
                },
            });

            deviceIds.forEach((obj) => {
                const deviceId = obj.id;

                rabbitMQChannel.sendToQueue(
                    Constants.QUEUE_SSE,
                    Buffer.from(
                        JSON.stringify({
                            channelId: deviceId,
                            data: {
                                type: Constants.STOP_CALL,
                                roomId: room.id,
                                roomType: room.type,
                            },
                        }),
                    ),
                );
            });

            res.send(successResponse("Call stopped"));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`));
        }
    });

    router.post("/accept", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const roomId: number = parseInt((req.body.roomId as string) || "");

        try {
            const room: Room = await prisma.room.findFirst({
                where: {
                    id: roomId,
                },
            });
            if (!room) {
                return res.status(404).send(errorResponse("Room not found"));
            }

            const call = await prisma.call.findFirst({
                where: { roomId, finishedAt: null },
            });

            if (!call) {
                return res.status(404).send(errorResponse("No ongoing call found in this room"));
            }

            const ongoingCallParticipant = await prisma.callParticipant.findFirst({
                where: {
                    userId: userReq.user.id,
                    leftAt: null,
                },
            });

            if (ongoingCallParticipant) {
                return res.status(400).send(
                    errorResponse("You are already in an ongoing call. Please leave the ongoing call before joining another one.")
                );
            }

            await prisma.callParticipant.upsert({
                where: {
                    call_user_unique: {
                        callId: call.id,
                        userId: userReq.user.id,
                    },
                },
                create: {
                    callId: call.id,
                    userId: userReq.user.id,
                    joinedAt: new Date(),
                },
                update: {
                    leftAt: null,
                },
            });

            const participantCount = await prisma.callParticipant.count({
                where: {
                    callId: call.id,
                    leftAt: null,
                },
            })

            if (participantCount > 2) {
                return res.send(successResponse("Call accepted"));
            };

            const userIds = await prisma.roomUser.findMany({
                where: {
                    roomId,
                    userId: {
                        not: userReq.user.id,
                    },
                },
                select: {
                    userId: true,
                },
            });

            const deviceIds = await prisma.device.findMany({
                where: {
                    userId: { in: userIds.map((obj) => obj.userId) },
                },
                select: {
                    id: true,
                },
            });

            deviceIds.forEach((obj) => {
                const deviceId = obj.id;

                rabbitMQChannel.sendToQueue(
                    Constants.QUEUE_SSE,
                    Buffer.from(
                        JSON.stringify({
                            channelId: deviceId,
                            data: {
                                type: Constants.ACCEPT_CALL,
                                roomId: room.id,
                                roomType: room.type,
                            },
                        }),
                    ),
                );
            });

            res.send(successResponse("Call accepted"));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`));
        }
    });

    router.post("/leave", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const roomId: number = parseInt((req.body.roomId as string) || "");

        try {
            const room: Room = await prisma.room.findFirst({
                where: {
                    id: roomId,
                },
            });
            if (!room) {
                return res.status(404).send(errorResponse("Room not found"));
            }

            const call = await prisma.call.findFirst({
                where: { roomId, finishedAt: null },
            });

            if (!call) {
                return res.status(404).send(errorResponse("No ongoing call found in this room"));
            }

            const isPrivate = room.type === "private"

            if (isPrivate) {
                await prisma.callParticipant.updateMany({
                    where: {
                        callId: call.id,
                    },
                    data: {
                        leftAt: new Date(),
                    },
                });

                await prisma.call.update({
                    where: { id: call.id },
                    data: {
                        finishedAt: new Date(),
                    },
                });

                const userIds = await prisma.roomUser.findMany({
                    where: {
                        roomId,
                    },
                    select: {
                        userId: true,
                    },
                });

                const deviceIds = await prisma.device.findMany({
                    where: {
                        userId: { in: userIds.map((obj) => obj.userId) }
                    },
                    select: {
                        id: true,
                    },
                });

                deviceIds.forEach((obj) => {
                    const deviceId = obj.id;

                    rabbitMQChannel.sendToQueue(
                        Constants.QUEUE_SSE,
                        Buffer.from(
                            JSON.stringify({
                                channelId: deviceId,
                                data: {
                                    type: Constants.LEAVE_CALL,
                                    roomId: room.id,
                                    roomType: room.type,
                                    userId: userReq.user.id,
                                },
                            }),
                        ),
                    );
                });

                return res.send(successResponse("Left Call"));
            }

            await prisma.callParticipant.update({
                where: {
                    call_user_unique: {
                        callId: call.id,
                        userId: userReq.user.id,
                    },
                },
                data: {
                    leftAt: new Date(),
                },
            });

            const remainingParticipants = await prisma.callParticipant.count({
                where: {
                    callId: call.id,
                    leftAt: null,
                },
            });

            let deviceIds: { id: number }[] = [];

            if (remainingParticipants === 0) {
                await prisma.call.update({
                    where: { id: call.id },
                    data: {
                        finishedAt: new Date(),
                    },
                });

                const deviceMessages = await prisma.deviceMessage.findMany({
                    where: {
                        message: {
                            roomId: roomId,
                            type: "system"
                        },
                        body: {
                            path: "$.type",
                            equals: Constants.SYSTEM_MESSAGE_TYPE_INITIATE_CALL,
                        },
                        AND: [
                            {
                                body: {
                                    path: "$.isOngoing",
                                    equals: true,
                                },
                            },
                        ],
                    },
                })

                for (const deviceMessage of deviceMessages) {
                    await prisma.deviceMessage.update({
                        where: { id: deviceMessage.id },
                        data: {
                            modifiedAt: new Date(),
                            body: {
                                ...(deviceMessage.body as Record<string, unknown>),
                                isOngoing: false
                            },
                        },
                    });
                }

                const message = await prisma.message.create({
                    data: {
                        type: Constants.SYSTEM_MESSAGE_TYPE,
                        roomId: room.id,
                        fromUserId: userReq.user.id,
                        totalUserCount: 0,
                        deliveredCount: 0,
                        seenCount: 0,
                    },
                });

                const roomUser = await prisma.roomUser.findFirst({
                    where: {
                        roomId: room.id,
                        userId: userReq.user.id
                    },
                    include: {
                        room: {
                            include: {
                                users: true
                            }
                        }
                    }
                })

                const sanitizedMessage = sanitize({
                    ...message,
                    body: {
                        text: "ended call",
                        user: userReq.user.displayName,
                        userId: userReq.user.id,
                        type: Constants.SYSTEM_MESSAGE_TYPE_END_CALL,
                        room: room.name,
                        roomId: room.id,
                    },
                }).message();

                rabbitMQChannel.sendToQueue(
                    Constants.QUEUE_MESSAGES_SSE,
                    Buffer.from(
                        JSON.stringify({
                            room: roomUser.room,
                            message: sanitizedMessage,
                        }),
                    ),
                );

                const userIds = await prisma.roomUser.findMany({
                    where: {
                        roomId,
                    },
                    select: {
                        userId: true,
                    },
                });

                deviceIds = await prisma.device.findMany({
                    where: {
                        userId: { in: userIds.map((obj) => obj.userId) }
                    },
                    select: {
                        id: true,
                    },
                });
            } else {
                deviceIds = await prisma.device.findMany({
                    where: {
                        userId: userReq.user.id,
                    },
                    select: {
                        id: true,
                    },
                });
            }

            deviceIds.forEach((obj) => {
                const deviceId = obj.id;

                rabbitMQChannel.sendToQueue(
                    Constants.QUEUE_SSE,
                    Buffer.from(
                        JSON.stringify({
                            channelId: deviceId,
                            data: {
                                type: Constants.LEAVE_CALL,
                                roomId: room.id,
                                roomType: room.type,
                                userId: userReq.user.id,
                                ...(remainingParticipants === 0 && { isEnded: true })
                            },
                        }),
                    ),
                );
            });

            return res.send(successResponse("Left Call"));

        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`));
        }
    });

    router.post("/reject", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const roomId: number = parseInt((req.body.roomId as string) || "");

        try {
            const room: Room = await prisma.room.findFirst({
                where: {
                    id: roomId,
                },
            });
            if (!room) {
                return res.status(404).send(errorResponse("Room not found"));
            }

            if (room.type !== "private") {
                return res.status(400).send(errorResponse("Only private room calls can be rejected"));
            }

            const call = await prisma.call.findFirst({
                where: { roomId, finishedAt: null },
            });

            if (!call) {
                return res.status(404).send(errorResponse("No ongoing call found in this room"));
            }

            await prisma.call.update({
                where: { id: call.id },
                data: {
                    finishedAt: new Date(),
                },
            });

            await prisma.callParticipant.updateMany({
                where: { callId: call.id },
                data: {
                    leftAt: new Date(),
                },
            });

            const userIds = await prisma.roomUser.findMany({
                where: {
                    roomId,
                    userId: {
                        not: userReq.user.id,
                    },
                },
                select: {
                    userId: true,
                },
            });

            const deviceIds = await prisma.device.findMany({
                where: {
                    userId: { in: userIds.map((obj) => obj.userId) },
                },
                select: {
                    id: true,
                },
            });

            deviceIds.forEach((obj) => {
                const deviceId = obj.id;

                rabbitMQChannel.sendToQueue(
                    Constants.QUEUE_SSE,
                    Buffer.from(
                        JSON.stringify({
                            channelId: deviceId,
                            data: {
                                type: Constants.REJECT_CALL,
                                roomId: room.id,
                                roomType: room.type,
                            },
                        }),
                    ),
                );
            });

            res.send(successResponse("Call rejected"));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`));
        }
    });

    return router;
};
