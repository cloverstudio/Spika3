import { Router, Request, Response } from "express";
import { User } from "@prisma/client";

import { error as le } from "../../../components/logger";
import { successResponse, errorResponse } from "../../../components/response";
import auth from "../lib/auth";
import { UserRequest } from "../lib/types";
import sanitize from "../../../components/sanitize";
import * as Constants from "../../../components/consts";

import prisma from "../../../components/prisma";

export default (): Router => {
    const router = Router();

    router.get("/:id", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        try {
            const id = parseInt((req.params.id as string) || "");
            if (id === userReq.user.id) {
                return res.send(
                    successResponse({ user: sanitize(userReq.user).user() }, userReq.lang)
                );
            }
            let user: User;

            if (+process.env["TEAM_MODE"]) {
                user = await prisma.user.findFirst({
                    where: {
                        id,
                    },
                });
            } else {
                const userContact = await prisma.contact.findFirst({
                    where: {
                        userId: userReq.user.id,
                        contactId: id,
                    },
                    include: {
                        contact: true,
                    },
                });

                user = userContact?.contact;
            }

            if (!user) {
                return res.status(404).send(errorResponse("User not found", userReq.lang));
            }

            res.send(successResponse({ user: sanitize(user).user() }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.get("/sync/:timestamp", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const timestamp = parseInt(req.params.timestamp as string);
        const page = parseInt((req.query.page as string) || "1");

        const skip = Constants.SYNC_LIMIT * (page - 1);

        try {
            if (isNaN(timestamp)) {
                return res
                    .status(400)
                    .send(errorResponse("timestamp must be number", userReq.lang));
            }

            if (isNaN(page)) {
                return res
                    .status(400)
                    .send(errorResponse("page must be valid number", userReq.lang));
            }

            let users: User[];
            let count: number;

            if (+process.env["TEAM_MODE"]) {
                users = await prisma.user.findMany({
                    where: {
                        modifiedAt: { gt: new Date(timestamp) },
                    },
                    skip,
                    take: Constants.SYNC_LIMIT,
                });
                count = await prisma.user.count({
                    where: {
                        modifiedAt: { gt: new Date(timestamp) },
                    },
                });
            } else {
                users = await getUsers(userReq.user.id, timestamp, skip);
                count = await getUsersCount(userReq.user.id, timestamp);
            }

            const hasNext = count > page * Constants.SYNC_LIMIT;

            res.send(
                successResponse(
                    {
                        list: users.map((user) => sanitize(user).user()),
                        count,
                        limit: Constants.SYNC_LIMIT,
                        hasNext,
                    },
                    userReq.lang
                )
            );
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    return router;
};

export async function getUsers(userId: number, timestamp: number, skip: number): Promise<User[]> {
    const userContact = await prisma.contact.findMany({
        where: {
            userId: userId,
            contact: {
                modifiedAt: { gt: new Date(timestamp) },
            },
        },
        include: {
            contact: true,
        },
    });

    const usersContacts = userContact.map((uc) => uc.contact);

    const usersRooms = await prisma.roomUser.findMany({
        where: {
            userId,
        },
    });

    const userRoomsIds = usersRooms.map((ur) => ur.roomId);

    const allUsers = await prisma.user.findMany({
        where: {
            OR: [
                {
                    id: {
                        notIn: [userId, ...usersContacts.map((u) => u.id)],
                    },
                    rooms: {
                        some: {
                            id: {
                                in: userRoomsIds,
                            },
                        },
                    },
                },
                {
                    id: {
                        in: usersContacts.map((u) => u.id),
                    },
                },
            ],
            AND: {
                modifiedAt: { gt: new Date(timestamp) },
            },
        },
        take: Constants.SYNC_LIMIT,
        skip,
    });

    return allUsers;
}

export async function getUsersCount(userId: number, timestamp: number): Promise<number> {
    const userContact = await prisma.contact.findMany({
        where: {
            userId: userId,
            contact: {
                modifiedAt: { gt: new Date(timestamp) },
            },
        },
        include: {
            contact: true,
        },
    });

    const usersContacts = userContact.map((uc) => uc.contact);

    const usersRooms = await prisma.roomUser.findMany({
        where: {
            userId,
        },
    });

    const userRoomsIds = usersRooms.map((ur) => ur.roomId);

    const allUsersCount = await prisma.user.count({
        where: {
            OR: [
                {
                    id: {
                        notIn: usersContacts.map((u) => u.id),
                    },
                    rooms: {
                        some: {
                            id: {
                                in: userRoomsIds,
                            },
                        },
                    },
                },
                {
                    id: {
                        in: usersContacts.map((u) => u.id),
                    },
                },
            ],
            AND: {
                id: {
                    notIn: [userId],
                },
                modifiedAt: { gt: new Date(timestamp) },
            },
        },
    });

    return allUsersCount;
}
