import { Router, Request, Response } from "express";

import { UserRequest, errorParams } from "../lib/types";
import { error as le } from "../../../components/logger";
import * as Constants from "../../../components/consts";

import auth from "../lib/auth";
import { InitRouterParams } from "../../types/serviceInterface";
import * as yup from "yup";
import validate from "../../../components/validateMiddleware";
import { successResponse, errorResponse } from "../../../components/response";
import sanitize from "../../../components/sanitize";
import prisma from "../../../components/prisma";
import { checkForAgentContacts } from "../../../components/agent";
import { Prisma } from "@prisma/client";

const getGroupMessageRoomSchema = yup.object().shape({
    query: yup.object().shape({
        cursor: yup.number().nullable(),
        keyword: yup.string().strict(),
    }),
});

export default ({ rabbitMQChannel }: InitRouterParams): Router => {
    const router = Router();

    router.get(
        "/",
        auth,
        validate(getGroupMessageRoomSchema),
        async (req: Request, res: Response) => {
            const userReq: UserRequest = req as UserRequest;
            const keyword = req.query.keyword as string;
            const cursor = parseInt(req.query.cursor ? (req.query.cursor as string) : "") || null;
            const take = cursor
                ? Constants.CONTACT_PAGING_LIMIT + 1
                : Constants.CONTACT_PAGING_LIMIT;

            if (!cursor) {
                await checkForAgentContacts(userReq.user.id);
            }

            const condition: Prisma.RoomWhereInput = {
                ...(keyword
                    ? {
                          OR: ["startsWith", "contains"].map((key) => ({
                              name: {
                                  [key]: keyword,
                              },
                          })),
                          AND: {
                              type: "group",
                              deleted: false,
                              users: {
                                  some: {
                                      user: { deleted: false, verified: true, id: userReq.user.id },
                                  },
                              },
                          },
                      }
                    : {
                          type: "group",
                          deleted: false,
                          users: {
                              some: {
                                  user: { deleted: false, verified: true, id: userReq.user.id },
                              },
                          },
                      }),
            };

            try {
                const rooms = await prisma.room.findMany({
                    where: condition,
                    orderBy: [
                        {
                            name: "asc",
                        },
                    ],
                    ...(cursor && {
                        cursor: {
                            id: cursor,
                        },
                    }),
                    take,
                    include: { users: true },
                });

                const count = await prisma.room.count({
                    where: condition,
                });

                const nextCursor =
                    rooms.length && rooms.length >= take ? rooms[rooms.length - 1].id : null;

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

                res.send(
                    successResponse(
                        {
                            groupMessageRoomList: rooms.map((g) => sanitize(g).room()),
                            recentGroupChats: recentGroups,
                            count,
                            limit: Constants.CONTACT_PAGING_LIMIT,
                            nextCursor,
                        },
                        userReq.lang,
                    ),
                );
            } catch (e: any) {
                le(e);
                res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
            }
        },
    );

    return router;
};
