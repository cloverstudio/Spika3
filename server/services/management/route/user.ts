import { Router, Request, Response } from "express";
import * as yup from "yup";

import adminAuth from "../lib/adminAuth";
import * as consts from "../../../components/consts";
import { error as le } from "../../../components/logger";
import { successResponse, errorResponse } from "../../../components/response";
import { UserRequest } from "../../messenger/lib/types";
import sanitize from "../../../components/sanitize";
import prisma from "../../../components/prisma";
import validate from "../../../components/validateMiddleware";
import { InitRouterParams } from "../../types/serviceInterface";

const getContactsSchema = yup.object().shape({
    query: yup.object().shape({
        cursor: yup.number().nullable(),
        keyword: yup.string().strict(),
    }),
});

export default ({ redisClient }: InitRouterParams) => {
    const router = Router();

    router.get(
        "/members",
        adminAuth,
        validate(getContactsSchema),
        async (req: Request, res: Response) => {
            const keyword = req.query.keyword as string;
            const cursor = parseInt(req.query.cursor ? (req.query.cursor as string) : "") || null;
            const take = cursor ? consts.CONTACT_PAGING_LIMIT + 1 : consts.CONTACT_PAGING_LIMIT;

            const condition: any = {
                verified: true,
                deleted: false,
            };

            if (keyword && keyword.length > 0)
                condition.displayName = {
                    startsWith: keyword,
                };

            try {
                const users = await prisma.user.findMany({
                    where: condition,
                    orderBy: [
                        {
                            displayName: "asc",
                        },
                    ],
                    ...(cursor && {
                        cursor: {
                            id: cursor,
                        },
                    }),
                    take,
                });

                const count = await prisma.user.count({
                    where: condition,
                });

                const nextCursor =
                    users.length && users.length >= take ? users[users.length - 1].id : null;

                res.send(
                    successResponse(
                        {
                            list: users.map((c) => sanitize(c).user()),
                            count,
                            limit: consts.CONTACT_PAGING_LIMIT,
                            nextCursor,
                        },
                        "en"
                    )
                );
            } catch (e: any) {
                le(e);
                res.status(500).send(errorResponse(`Server error ${e}`, "en"));
            }
        }
    );

    router.get("/", adminAuth, async (req: Request, res: Response) => {
        const page = parseInt(req.query.page ? (req.query.page as string) : "") || 1;
        const userReq: UserRequest = req as UserRequest;
        const keyword = req.query.keyword as string;

        try {
            const users = await prisma.user.findMany({
                where: {
                    ...(keyword
                        ? {
                              OR: ["startsWith", "contains"].map((key) => ({
                                  displayName: {
                                      [key]: keyword,
                                  },
                              })),
                              AND: {
                                  isBot: false,
                                  deleted: false,
                              },
                          }
                        : {
                              isBot: false,
                              deleted: false,
                          }),
                },
                orderBy: {
                    displayName: "asc",
                },
                skip: consts.ADMIN_USERS_PAGING_LIMIT * (page - 1),
                take: consts.ADMIN_USERS_PAGING_LIMIT,
            });

            const count = await prisma.user.count({
                where: {
                    ...(keyword
                        ? {
                              OR: ["startsWith", "contains"].map((key) => ({
                                  displayName: {
                                      [key]: keyword,
                                  },
                              })),
                              AND: {
                                  isBot: false,
                                  deleted: false,
                              },
                          }
                        : {
                              isBot: false,
                              deleted: false,
                          }),
                },
            });
            res.send(
                successResponse(
                    {
                        list: users,
                        count: count,
                        limit: consts.ADMIN_USERS_PAGING_LIMIT,
                    },
                    userReq.lang
                )
            );
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.get("/:userId", adminAuth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        try {
            const userId: number = parseInt(req.params.userId);

            const user = await prisma.user.findFirst({
                where: {
                    id: userId,
                },
            });

            if (!user) return res.status(404).send(errorResponse(`Wrong user id`, userReq.lang));

            return res.send(successResponse({ user: sanitize(user).user() }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.get("/:userId/groups", adminAuth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        try {
            const userId: number = parseInt(req.params.userId);

            const user = await prisma.user.findFirst({
                where: {
                    id: userId,
                },
            });

            if (!user) return res.status(404).send(errorResponse(`Wrong user id`, userReq.lang));

            const roomsUser = await prisma.roomUser.findMany({
                where: {
                    userId,
                },
            });

            const rooms = await prisma.room.findMany({
                where: {
                    id: {
                        in: roomsUser.map((r) => r.roomId),
                    },
                    type: "group",
                },
                include: {
                    users: {
                        include: {
                            user: true,
                        },
                    },
                },
            });

            return res.send(
                successResponse({ rooms: rooms.map((r) => sanitize(r).room()) }, userReq.lang)
            );
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.get("/:userId/devices", adminAuth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        try {
            const userId: number = parseInt(req.params.userId);

            const user = await prisma.user.findFirst({
                where: {
                    id: userId,
                },
            });

            if (!user) {
                return res.status(404).send(errorResponse(`User not found`, userReq.lang));
            }

            const devices = await prisma.device.findMany({
                where: {
                    userId,
                },
            });

            return res.send(
                successResponse({ devices: devices.map((d) => sanitize(d).device()) }, userReq.lang)
            );
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.put(
        "/:userId/devices/:deviceId/expire",
        adminAuth,
        async (req: Request, res: Response) => {
            const userReq: UserRequest = req as UserRequest;
            try {
                const userId = parseInt(req.params.userId);
                const deviceId = parseInt(req.params.deviceId);

                const user = await prisma.user.findFirst({
                    where: {
                        id: userId,
                    },
                });

                if (!user) {
                    return res.status(404).send(errorResponse("User not found", userReq.lang));
                }

                const device = await prisma.device.findUnique({
                    where: {
                        id: deviceId,
                    },
                });

                if (!device) {
                    return res.status(404).send(errorResponse("Device not found", userReq.lang));
                }

                await prisma.device.update({
                    where: {
                        id: device.id,
                    },
                    data: {
                        tokenExpiredAt: new Date(),
                        token: null,
                        modifiedAt: new Date(),
                    },
                });

                return res.send(successResponse({ expired: true }, userReq.lang));
            } catch (e: any) {
                le(e);
                res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
            }
        }
    );

    router.put("/:userId", adminAuth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        try {
            const userId: number = parseInt(req.params.userId);

            const displayName: string = req.body.displayName;
            const emailAddress: string = req.body.emailAddress;
            const telephoneNumber: string = req.body.telephoneNumber;
            const avatarFileId: number = req.body.avatarFileId;
            const verified: boolean = req.body.verified;
            const verificationCode: string = req.body.verificationCode;

            const user = await prisma.user.findFirst({
                where: {
                    id: userId,
                },
            });

            if (!user) {
                return res.status(404).send(errorResponse(`Wrong user id`, userReq.lang));
            }

            const phoneNumber = await prisma.user.findFirst({
                where: {
                    telephoneNumber: telephoneNumber,
                },
            });
            const email = await prisma.user.findUnique({
                where: {
                    emailAddress: emailAddress,
                },
            });

            if (
                phoneNumber != null &&
                phoneNumber.id != user.id &&
                email != null &&
                email.id != user.id
            ) {
                return res
                    .status(400)
                    .send(errorResponse(`Phone number and email are already in use`, userReq.lang));
            } else if (phoneNumber != null && phoneNumber.id != user.id) {
                return res
                    .status(400)
                    .send(errorResponse(`Phone number is already in use`, userReq.lang));
            } else if (email != null && email.id != user.id) {
                return res.status(400).send(errorResponse(`Email is already in use`, userReq.lang));
            }

            const updateValues: any = {};
            if (displayName) updateValues.displayName = displayName;
            if (emailAddress) updateValues.emailAddress = emailAddress;
            if (telephoneNumber) updateValues.telephoneNumber = telephoneNumber;
            if (avatarFileId !== undefined) updateValues.avatarFileId = avatarFileId;
            if (verified != null) updateValues.verified = verified;
            if (verificationCode) updateValues.verificationCode = verificationCode;

            if (Object.keys(updateValues).length == 0) {
                return res.status(400).send(errorResponse(`Nothing to update`, userReq.lang));
            }

            const updateUser = await prisma.user.update({
                where: { id: userId },
                data: updateValues,
            });

            res.send(successResponse({ user: updateUser }, userReq.lang));

            const roomsUser = await prisma.roomUser.findMany({
                where: { userId },
            });

            for (const roomUser of roomsUser) {
                const key = `${consts.ROOM_PREFIX}${roomUser.roomId}`;
                await redisClient.del(key);
            }
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.delete("/:userId", adminAuth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        try {
            const userId = parseInt(req.params.userId);

            const user = await prisma.user.update({
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

            if (!user) {
                return res.status(404).send(errorResponse(`Wrong user id`, userReq.lang));
            }

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

            res.send(successResponse({ deleted: true }, userReq.lang));

            // delete private rooms from redis
            const roomsUser = await prisma.roomUser.findMany({
                where: { userId },
            });

            for (const roomUser of roomsUser) {
                const key = `${consts.ROOM_PREFIX}${roomUser.roomId}`;
                await redisClient.del(key);
            }

            // delete group rooms from redis
            for (const room of rooms) {
                const key = `${consts.ROOM_PREFIX}${room.id}`;
                await redisClient.del(key);
            }
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    return router;
};
