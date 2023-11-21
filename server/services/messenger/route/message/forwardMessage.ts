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
        roomsIds: yup.array().default([]).of(yup.number().strict().min(1)),
        usersIds: yup.array().default([]).of(yup.number().strict().min(1)),
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
                const messageId: number = +req.params.id;

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

                const roomUser = await prisma.roomUser.findFirst({
                    where: {
                        userId: fromUserId,
                        roomId: message.roomId,
                    },
                });

                if (!roomUser) {
                    return res.status(403).send(errorResponse("User is not in room", userReq.lang));
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

                const roomsFromRoomsIds = await Promise.all(
                    roomsIds.map((id) => getRoomById(id, redisClient)),
                );

                const nonExistingRooms = roomsIds.filter(
                    (roomId) => !roomsFromRoomsIds.map((r) => r?.id).includes(roomId),
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

                const userIsNotInSomeRoom = roomsFromRoomsIds.some(
                    ({ users }) => !users.map((u) => u.userId).includes(fromUserId),
                );

                if (userIsNotInSomeRoom) {
                    return res
                        .status(400)
                        .send(
                            errorResponse(
                                "User is not in one or more rooms sent in roomsIds",
                                userReq.lang,
                            ),
                        );
                }

                const privateRooms = await findPrivateRooms(fromUserId, usersIds);

                console.log({ roomsFromRoomsIds, userIsNotInSomeRoom });
                console.log({ privateRooms });

                return res.status(200).send(successResponse("Message forwarded", userReq.lang));
            } catch (e: unknown) {
                le(e);
                res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
            }
        },
    ];
};

async function findPrivateRooms(userId: number, otherUsersIds: number[]) {
    const rooms = [];

    for (const id of otherUsersIds) {
        // Get room id where two user belongs to.
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
            console.log("room exists");
            rooms.push(...roomsResult);
        } else {
            // create private room
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
            });
            console.log("room created");

            rooms.push(room);
        }
    }

    return rooms;
}
