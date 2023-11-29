import { Router, Request, Response } from "express";

import { UserRequest, errorParams } from "../lib/types";
import { error as le } from "../../../components/logger";
import * as Constants from "../../../components/consts";

import auth from "../lib/auth";
import { InitRouterParams } from "../../types/serviceInterface";
import { successResponse, errorResponse } from "../../../components/response";
import sanitize from "../../../components/sanitize";
import prisma from "../../../components/prisma";

export default ({ rabbitMQChannel }: InitRouterParams): Router => {
    const router = Router();

    router.get("/", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        try {
            //fetch last 3 group chats
            const roomUser = await prisma.roomUser.findMany({
                where: {
                    userId: userReq.user.id,
                    room: { type: "group" },
                },
            });

            const roomIds = roomUser.map((ru) => ru.roomId);

            const messages = await prisma.message.findMany({
                where: {
                    deleted: false,
                    roomId: { in: roomIds },
                },
                distinct: ["roomId"],
                orderBy: {
                    createdAt: "desc",
                },
                take: 3,
            });

            const recentGroups = [];

            for (const message of messages) {
                const rooms = await prisma.room.findUnique({
                    where: {
                        id: message.roomId,
                    },
                });

                if (roomUser) {
                    recentGroups.push(rooms);
                }
            }

            if (+process.env["TEAM_MODE"]) {
                //fetch last 3 private chat users
                const roomUser = await prisma.roomUser.findMany({
                    where: {
                        userId: userReq.user.id,
                        room: { type: "private" },
                    },
                });

                const roomIds = roomUser.map((ru) => ru.roomId);

                const messages = await prisma.message.findMany({
                    where: {
                        deleted: false,
                        roomId: { in: roomIds },
                        room: { users: { every: { user: { isBot: false } } } },
                    },
                    distinct: ["roomId"],
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 3,
                });

                const userIds = [];

                for (const message of messages) {
                    const roomUser = await prisma.roomUser.findFirst({
                        where: {
                            roomId: message.roomId,
                            userId: { not: userReq.user.id },
                        },
                    });

                    if (roomUser) {
                        userIds.push(roomUser.userId);
                    }
                }

                const recentUserChats = await prisma.user.findMany({
                    where: {
                        id: { in: userIds },
                    },
                });

                res.send(
                    successResponse(
                        {
                            recentUserChats: recentUserChats.map((c) => sanitize(c).user()),
                            recentGroupChats: recentGroups,
                        },
                        userReq.lang,
                    ),
                );
            } else {
                const contacts = await prisma.contact.findMany({
                    where: {
                        userId: userReq.user.id,
                    },
                });

                // fetch last 3 private chat users

                const roomUser = await prisma.roomUser.findMany({
                    where: {
                        userId: userReq.user.id,
                        room: { type: "private" },
                    },
                });

                const roomIds = roomUser.map((ru) => ru.roomId);

                const contactsInTheRoom = await prisma.roomUser.findMany({
                    where: {
                        roomId: { in: roomIds },
                        userId: { in: contacts.map((c) => c.contactId) },
                        user: { isBot: false },
                    },
                });

                const roomIdsWithMyContacts = contactsInTheRoom.map((ru) => ru.roomId);

                const messages = await prisma.message.findMany({
                    where: {
                        deleted: false,
                        roomId: { in: roomIdsWithMyContacts },
                    },
                    distinct: ["roomId"],
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 3,
                });

                const recentContactIds = [];

                for (const message of messages) {
                    const roomUser = await prisma.roomUser.findFirst({
                        where: {
                            roomId: message.roomId,
                            userId: { not: userReq.user.id },
                        },
                    });

                    if (roomUser) {
                        recentContactIds.push(roomUser.userId);
                    }
                }

                const recentContacts = await prisma.user.findMany({
                    where: {
                        id: { in: recentContactIds },
                    },
                });

                res.send(
                    successResponse(
                        {
                            recentUserChats: recentContacts.map((c) => sanitize(c).user()),
                            recentGroupChats: recentGroups,
                        },
                        userReq.lang,
                    ),
                );
            }
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    return router;
};
