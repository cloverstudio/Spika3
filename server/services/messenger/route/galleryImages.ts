import { Router, Request, Response } from "express";
import { UserRequest } from "../lib/types";
import { error as le } from "../../../components/logger";
import * as Constants from "../../../components/consts";
import auth from "../lib/auth";
import { successResponse, errorResponse } from "../../../components/response";
import prisma from "../../../components/prisma";
import { formatMessageBody } from "../../../components/message";

export default (): Router => {
    const router = Router();

    router.get("/", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        const roomId = parseInt(req.query.roomId as string);
        const cursor = parseInt(req.query.cursor as string);

        const take =
            parseInt(req.query.itemsPerBatch as string) || Constants.GALLERY_IMAGE_PAGING_LIMIT;

        const fetchNewer = req.query.fetchNewer === "true";
        const fetchOlder = req.query.fetchOlder === "true";

        const types = ["image", "video"];

        if (!roomId) {
            return res.status(400).send(errorResponse("Invalid room id", userReq.lang));
        }

        const cursorMessage = await prisma.message.findFirst({
            where: {
                id: cursor,
                roomId,
                deleted: false,
                type: { in: types },
            },
            select: { createdAt: true },
        });

        try {
            const roomImageMessages = await prisma.message.findMany({
                where: {
                    roomId,
                    deleted: false,
                    type: { in: types },
                    ...(fetchNewer &&
                        cursorMessage && { createdAt: { gt: cursorMessage.createdAt } }),
                    ...(fetchOlder &&
                        cursorMessage && { createdAt: { lt: cursorMessage.createdAt } }),
                },
                select: {
                    id: true,
                    type: true,
                    fromUser: { select: { id: true, displayName: true } },
                    createdAt: true,
                },
                orderBy: { createdAt: fetchNewer ? "asc" : "desc" },
                ...(!fetchNewer && !fetchOlder && { cursor: { id: cursor } }),
                take,
            });

            // find out if there are more older images
            const minCreatedAt = roomImageMessages.reduce(
                (min, message) => (message.createdAt < min ? message.createdAt : min),
                new Date(),
            );

            const hasMoreOlderImages =
                (await prisma.message.count({
                    where: {
                        roomId,
                        deleted: false,
                        type: { in: types },
                        createdAt: { lt: minCreatedAt },
                    },
                })) > 0;

            // find out if there are more newer images
            const maxCreatedAt = roomImageMessages.reduce(
                (max, message) => (message.createdAt > max ? message.createdAt : max),
                new Date(0),
            );

            const hasMoreNewerImages =
                (await prisma.message.count({
                    where: {
                        roomId,
                        deleted: false,
                        type: { in: types },
                        createdAt: {
                            gt: maxCreatedAt,
                        },
                    },
                })) > 0;

            const imageMessagesList = await Promise.all(
                roomImageMessages.map(async (imageMessage) => {
                    const deviceMessage = await prisma.deviceMessage.findFirst({
                        where: {
                            messageId: imageMessage.id,
                            deleted: false,
                        },
                        select: {
                            body: true,
                            createdAt: true,
                            id: true,
                        },
                    });

                    const body = deviceMessage.body;

                    const formattedBody = await formatMessageBody(body, imageMessage.type);

                    return {
                        messageId: imageMessage.id,
                        type: imageMessage.type,
                        body: formattedBody,
                        userId: imageMessage.fromUser.id,
                        username: imageMessage.fromUser.displayName,
                        date: deviceMessage.createdAt,
                    };
                }),
            );

            res.send(
                successResponse(
                    {
                        list: fetchNewer ? imageMessagesList : imageMessagesList.reverse(),
                        hasMoreOlderImages,
                        hasMoreNewerImages,
                    },
                    userReq.lang,
                ),
            );
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    return router;
};
