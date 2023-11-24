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
import { Room } from "@prisma/client";

const forwardMessageBody = yup.object().shape({
    body: yup.object().shape({
        roomIds: yup.array().default([]).of(yup.number().strict().min(1)),
        userIds: yup.array().default([]).of(yup.number().strict().min(1)),
        messageIds: yup.array().default([]).of(yup.number().strict().min(1)).required(),
    }),
});

export default ({ rabbitMQChannel, redisClient }: InitRouterParams): RequestHandler[] => {
    return [
        auth,
        validate(forwardMessageBody),
        async (req: Request, res: Response) => {
            const userReq: UserRequest = req as UserRequest;

            try {
                const roomIds: number[] = req.body.roomIds;
                const userIds: number[] = req.body.userIds;
                const messageIds: number[] = req.body.messageIds;

                const fromUserId = userReq.user.id;
                const fromDeviceId = userReq.device.id;

                const messagesAndDeviceMessages = [];

                for (const messageId of messageIds) {
                    const message = await prisma.message.findUnique({
                        where: {
                            id: messageId,
                        },
                    });

                    if (!message) {
                        return res
                            .status(404)
                            .send(errorResponse("Message not found", userReq.lang));
                    }

                    const roomUser = await prisma.roomUser.findFirst({
                        where: {
                            userId: fromUserId,
                            roomId: message.roomId,
                        },
                    });

                    if (!roomUser) {
                        return res
                            .status(403)
                            .send(errorResponse("User is not in room", userReq.lang));
                    }

                    const deviceMessage = await prisma.deviceMessage.findFirst({
                        where: {
                            messageId,
                            userId: fromUserId,
                        },
                    });

                    if (!deviceMessage) {
                        return res
                            .status(403)
                            .send(errorResponse("No device message found", userReq.lang));
                    }

                    messagesAndDeviceMessages.push({
                        message,
                        deviceMessage,
                    });
                }

                const roomsFromRoomIds = await Promise.all(
                    roomIds.map((id) => getRoomById(id, redisClient)),
                );

                const nonExistingRooms = roomIds.filter(
                    (roomId) => !roomsFromRoomIds.map((r) => r?.id).includes(roomId),
                );

                if (nonExistingRooms.length) {
                    return res
                        .status(400)
                        .send(
                            errorResponse(
                                `Room with id ${nonExistingRooms[0]} does not exist`,
                                userReq.lang,
                            ),
                        );
                }

                const userIsNotInSomeRoom = roomsFromRoomIds.some(
                    ({ users }) => !users.map((u) => u.userId).includes(fromUserId),
                );

                if (userIsNotInSomeRoom) {
                    return res
                        .status(400)
                        .send(
                            errorResponse(
                                "User is not in one or more rooms sent in roomIds",
                                userReq.lang,
                            ),
                        );
                }

                const privateRooms = await findPrivateRooms(fromUserId, userIds);

                const allRooms = [...roomsFromRoomIds, ...privateRooms];

                const sanitizedMessages = [];
                const newRooms = privateRooms.filter((r) => r.isNew).map((r) => sanitize(r).room());

                for (const { message, deviceMessage } of messagesAndDeviceMessages) {
                    const body = deviceMessage.body;
                    const type = message.type;

                    for (const room of allRooms) {
                        const blocked = await isRoomBlocked(room.id, fromUserId);

                        if (blocked) {
                            continue;
                        }

                        const roomId = room.id;
                        const allReceivers = room.users;

                        const message = await prisma.message.create({
                            data: {
                                type,
                                roomId,
                                fromUserId: userReq.user.id,
                                fromDeviceId: userReq.device.id,
                                totalUserCount: allReceivers.length,
                                deliveredCount: 0,
                                seenCount: 0,
                                isForwarded: true,
                            },
                        });

                        const userDeviceMessage = await prisma.deviceMessage.create({
                            data: {
                                userId: fromUserId,
                                deviceId: fromDeviceId,
                                fromUserId,
                                fromDeviceId,
                                body,
                                action: MESSAGE_ACTION_NEW_MESSAGE,
                                messageId: message.id,
                            },
                        });

                        const formattedBody = await formatMessageBody(body, type);
                        const sanitizedMessage = sanitize({
                            ...message,
                            body: formattedBody,
                            createdAt: userDeviceMessage.createdAt,
                            modifiedAt: userDeviceMessage.modifiedAt,
                        }).message();

                        sanitizedMessages.push(sanitizedMessage);

                        rabbitMQChannel.sendToQueue(
                            Constants.QUEUE_MESSAGES_SSE,
                            Buffer.from(
                                JSON.stringify({
                                    room,
                                    message: sanitizedMessage,
                                }),
                            ),
                        );

                        rabbitMQChannel.sendToQueue(
                            Constants.QUEUE_WEBHOOK,
                            Buffer.from(
                                JSON.stringify({
                                    messageId: message.id,
                                    body,
                                }),
                            ),
                        );

                        handleNewMessage({
                            body,
                            fromUserId,
                            room,
                            users: room.users.map((u) => u.user),
                            messageType: type,
                        });
                    }
                }

                return res
                    .status(200)
                    .send(successResponse({ messages: sanitizedMessages, newRooms }, userReq.lang));
            } catch (e: unknown) {
                le(e);
                res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
            }
        },
    ];
};

async function findPrivateRooms(userId: number, otherUserIds: number[]) {
    const rooms = [];

    for (const id of otherUserIds) {
        const query = `
        select * from room 
            where type = 'private' 
            and deleted = false 
            and id in ( 
                select room_id from room_user where user_id in 
                    (
                        ${userId},${id}
                    ) group by room_id having count(*) > 1 
            )`;

        const roomsResult: Room[] = await prisma.$queryRawUnsafe<Room[]>(query);

        if (roomsResult.length) {
            const results = await prisma.room.findMany({
                where: {
                    id: {
                        in: roomsResult.map((r) => r.id),
                    },
                },
                include: {
                    users: {
                        include: {
                            user: true,
                        },
                    },
                },
            });

            rooms.push(...results);
        } else {
            const room = await prisma.room.create({
                data: {
                    type: "private",
                    name: "",
                    users: {
                        createMany: {
                            data: [
                                {
                                    userId,
                                },
                                { userId: id },
                            ],
                        },
                    },
                },
                include: {
                    users: {
                        include: {
                            user: true,
                        },
                    },
                },
            });

            rooms.push({ ...room, isNew: true });
        }
    }

    return rooms;
}
