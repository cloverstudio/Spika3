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
        const cursor = req.query.cursor ? parseInt(req.query.cursor as string) : undefined;
        const type = req.query.type as string;

        const availableTypes = ["media", "file", "link"];

        if (!roomId) {
            return res.status(400).send(errorResponse("Invalid room id", userReq.lang));
        }

        if (!type || !availableTypes.includes(type)) {
            return res.status(400).send(errorResponse("Invalid type", userReq.lang));
        }

        const take = parseInt(req.query.itemsPerBatch as string) || Constants.MEDIA_PAGING_LIMIT;

        const types = {
            media: ["image", "video"],
            file: ["file"],
            link: ["text"],
        }[type];

        try {
            const roomMessages = await prisma.message.findMany({
                where: {
                    roomId,
                    deleted: false,
                    type: { in: types },
                    ...(type === "link" && { hasLink: true }),
                },
                select: {
                    id: true,
                    type: true,
                    fromUser: { select: { id: true, displayName: true } },
                    createdAt: true,
                },
                orderBy: { createdAt: "desc" },
                ...(cursor && { cursor: { id: cursor }, skip: 1 }),

                take,
            });

            const count = await prisma.message.count({
                where: {
                    roomId,
                    deleted: false,
                    type: { in: types },
                    ...(type === "link" && { hasLink: true }),
                },
            });

            const messagesList = await Promise.all(
                roomMessages.map(async (message) => {
                    const deviceMessage = await prisma.deviceMessage.findFirst({
                        where: {
                            messageId: message.id,
                            deleted: false,
                        },
                        select: {
                            body: true,
                            createdAt: true,
                            id: true,
                        },
                    });

                    if (!deviceMessage) return null;
                    const body = deviceMessage.body;

                    const formattedBody = await formatMessageBody(body, message.type);

                    return {
                        messageId: message.id,
                        type: message.type,
                        body: formattedBody,
                        userId: message.fromUser.id,
                        username: message.fromUser.displayName,
                        date: deviceMessage.createdAt,
                    };
                }),
            );

            const filteredMessagesList = messagesList.filter((item) => item?.messageId);

            res.send(
                successResponse(
                    {
                        list: filteredMessagesList,
                        count,
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
