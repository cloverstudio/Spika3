import { Router, Request, Response } from "express";
import { Device, User, UserSetting } from "@prisma/client";

import { error as le } from "../../../components/logger";
import validate from "../../../components/validateMiddleware";
import * as yup from "yup";
import { successResponse, errorResponse } from "../../../components/response";
import auth from "../lib/auth";
import { UserRequest } from "../lib/types";
import sanitize from "../../../components/sanitize";
import Utils from "../../../components/utils";
import { InitRouterParams } from "../../types/serviceInterface";
import * as Constants from "../../../components/consts";
import prisma from "../../../components/prisma";

const updateSchema = yup.object().shape({
    body: yup.object().shape({
        telephoneNumber: yup.string().strict(),
        emailAddress: yup.string().strict(),
        displayName: yup.string().strict(),
        avatarFileId: yup.number().strict(),
    }),
});

export default ({ rabbitMQChannel, redisClient }: InitRouterParams): Router => {
    const router = Router();

    router.get("/", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        try {
            res.send(successResponse({ user: sanitize(userReq.user).user() }));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.put("/", auth, validate(updateSchema), async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const id = userReq.user.id;

        try {
            const { telephoneNumber, emailAddress, displayName, avatarFileId } = req.body;

            const userWithSameEmailAddress =
                emailAddress &&
                (await prisma.user.findFirst({
                    where: { emailAddress, id: { not: id } },
                }));
            if (userWithSameEmailAddress) {
                return res
                    .status(400)
                    .send(errorResponse("User with that email exists", userReq.lang));
            }

            const userWithSameTelephoneNumber =
                telephoneNumber &&
                (await prisma.user.findFirst({
                    where: { telephoneNumber, id: { not: id } },
                }));
            if (userWithSameTelephoneNumber) {
                return res
                    .status(400)
                    .send(errorResponse("User with that telephoneNumber exists", userReq.lang));
            }

            const user = await prisma.user.update({
                where: { id },
                data: {
                    telephoneNumber,
                    emailAddress,
                    displayName,
                    avatarFileId: parseInt(avatarFileId || "0"),
                    ...(telephoneNumber && {
                        telephoneNumberHashed: Utils.sha256(telephoneNumber),
                    }),
                    modifiedAt: new Date(),
                },
            });

            res.send(successResponse({ user: sanitize(user).user() }));

            const contacts = +process.env["TEAM_MODE"]
                ? await prisma.user.findMany({ include: { device: true } })
                : await getUserContacts(userReq.user.id);

            for (const contact of contacts) {
                for (const device of contact.device) {
                    rabbitMQChannel.sendToQueue(
                        Constants.QUEUE_SSE,
                        Buffer.from(
                            JSON.stringify({
                                channelId: device.id,
                                data: {
                                    type: Constants.PUSH_TYPE_USER_UPDATE,
                                    user: sanitize(user).user(),
                                },
                            })
                        )
                    );
                }
            }

            const roomsUser = await prisma.roomUser.findMany({
                where: { userId: user.id },
            });

            for (const roomUser of roomsUser) {
                const key = `${Constants.ROOM_PREFIX}${roomUser.roomId}`;
                await redisClient.del(key);
            }
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.get("/settings", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        try {
            const settings: UserSetting[] = await prisma.userSetting.findMany({
                where: {
                    userId: userReq.user.id,
                },
            });

            res.send(successResponse({ settings }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.delete("/", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        try {
            const userId = userReq.user.id;

            await prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    deleted: true,
                    modifiedAt: new Date(),
                    displayName: `Deleted user ${userId}`,
                    avatarFileId: 0,
                    telephoneNumberHashed: null,
                    telephoneNumber: null,
                    emailAddress: null,
                },
            });

            res.send(successResponse({ deleted: true }, userReq.lang));

            const userDevices = await prisma.device.findMany({ where: { userId } });

            const userDevicesIds = userDevices.map((d) => d.id);

            await prisma.message.updateMany({
                where: {
                    fromDeviceId: { in: userDevicesIds },
                },
                data: {
                    fromDeviceId: null,
                },
            });

            await prisma.deviceMessage.deleteMany({
                where: { userId },
            });

            await prisma.messageRecord.deleteMany({
                where: { userId },
            });

            await prisma.device.deleteMany({
                where: { userId },
            });

            await prisma.contact.deleteMany({
                where: { OR: [{ contactId: userId }, { userId }] },
            });

            const rooms = await prisma.room.findMany({
                where: { users: { some: { userId } }, type: "group" },
            });

            await prisma.roomUser.deleteMany({
                where: { userId, roomId: { in: rooms.map((r) => r.id) } },
            });

            await prisma.callHistory.deleteMany({
                where: { userId },
            });

            await prisma.userSetting.deleteMany({
                where: { userId },
            });

            await prisma.block.deleteMany({
                where: { OR: [{ blockedId: userId }, { userId }] },
            });

            // delete private rooms from redis
            const roomsUser = await prisma.roomUser.findMany({
                where: { userId },
            });

            for (const roomUser of roomsUser) {
                const key = `${Constants.ROOM_PREFIX}${roomUser.roomId}`;
                await redisClient.del(key);
            }

            // delete group rooms from redis
            for (const room of rooms) {
                const key = `${Constants.ROOM_PREFIX}${room.id}`;
                await redisClient.del(key);
            }
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    return router;
};

async function getUserContacts(userId: number): Promise<(User & { device: Device[] })[]> {
    const userContact = await prisma.contact.findMany({
        where: {
            userId,
        },
        include: {
            contact: {
                include: {
                    device: true,
                },
            },
        },
    });

    const usersContacts = userContact.map((uc) => uc.contact);

    const usersRooms = await prisma.roomUser.findMany({
        where: {
            userId,
        },
    });

    const userRoomsIds = usersRooms.map((ur) => ur.roomId);

    const allUsersInRooms = await prisma.roomUser.findMany({
        where: {
            roomId: {
                in: userRoomsIds,
            },
            user: {
                id: {
                    notIn: [userId, ...usersContacts.map((u) => u.id)],
                },
            },
        },
        include: {
            user: {
                include: {
                    device: true,
                },
            },
        },
    });

    const usersFromRooms = allUsersInRooms.map((ur) => ur.user);

    return [...usersContacts, ...usersFromRooms];
}
