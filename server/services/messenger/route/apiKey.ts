import { Router, Request, Response } from "express";

import { UserRequest } from "../lib/types";
import * as yup from "yup";
import validate from "../../../components/validateMiddleware";

import { error as le } from "../../../components/logger";
import auth from "../lib/auth";
import { InitRouterParams } from "../../types/serviceInterface";
import { successResponse, errorResponse } from "../../../components/response";
import sanitize from "../../../components/sanitize";
import utils from "../../../components/utils";
import prisma from "../../../components/prisma";

const postApiKeySchema = yup.object().shape({
    body: yup.object().shape({
        displayName: yup.string().strict().required(),
    }),
});

export default ({}: InitRouterParams): Router => {
    const router = Router();

    router.post(
        "/roomId/:roomId",
        auth,
        validate(postApiKeySchema),
        async (req: Request, res: Response) => {
            const userReq: UserRequest = req as UserRequest;

            try {
                const roomId = parseInt((req.params.roomId as string) || "");
                const displayName = req.body.displayName as string;

                const canAccess = await canAccessRoomApiKey(userReq.user.id, roomId);

                if (!canAccess) {
                    return res
                        .status(403)
                        .send(
                            errorResponse(
                                "User is not in room or he is not admin in this room",
                                userReq.lang
                            )
                        );
                }

                const botUser = await prisma.user.create({
                    data: { displayName, isBot: true, verified: true },
                });

                const apiKey = await prisma.apiKey.create({
                    data: { roomId, userId: botUser.id, token: utils.randomString(16) },
                });

                await prisma.roomUser.create({ data: { userId: botUser.id, roomId } });

                res.send(successResponse({ apiKey: sanitize(apiKey).apiKey() }, userReq.lang));
            } catch (e: any) {
                le(e);
                res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
            }
        }
    );

    router.get("/roomId/:roomId", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        try {
            const roomId = parseInt(req.params.roomId || "");

            const canAccess = await canAccessRoomApiKey(userReq.user.id, roomId);

            if (!canAccess) {
                return res
                    .status(403)
                    .send(
                        errorResponse(
                            "User is not in room or he is not admin in this room",
                            userReq.lang
                        )
                    );
            }

            const apiKeys = await prisma.apiKey.findMany({ where: { roomId } });
            const botUsers = await prisma.user.findMany({
                where: { id: { in: apiKeys.map((a) => a.userId) } },
                select: { displayName: true, id: true },
            });

            res.send(
                successResponse(
                    {
                        apiKeys: apiKeys.map((n) =>
                            sanitize({
                                ...n,
                                displayName:
                                    botUsers.find((u) => u.id === n.userId)?.displayName || "",
                            }).apiKey()
                        ),
                    },
                    userReq.lang
                )
            );
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.put("/:id", auth, validate(postApiKeySchema), async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        try {
            const { displayName } = req.body;
            const id = parseInt(req.params.id || "");

            const apiKey = await prisma.apiKey.findUnique({ where: { id } });

            if (!apiKey) {
                return res.status(404).send(errorResponse("Not found", userReq.lang));
            }

            const canAccess = await canAccessRoomApiKey(userReq.user.id, apiKey.roomId);

            if (!canAccess) {
                return res
                    .status(403)
                    .send(
                        errorResponse(
                            "User is not in room or he is not admin in this room",
                            userReq.lang
                        )
                    );
            }

            await prisma.user.update({
                where: { id: apiKey.userId },
                data: { displayName },
            });

            res.send(
                successResponse(
                    { apiKey: sanitize({ ...apiKey, displayName }).apiKey() },
                    userReq.lang
                )
            );
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.delete("/:id", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        try {
            const id = parseInt(req.params.id || "");

            const apiKey = await prisma.apiKey.findUnique({ where: { id } });

            if (!apiKey) {
                return res.status(404).send(errorResponse("Not found", userReq.lang));
            }

            const canAccess = await canAccessRoomApiKey(userReq.user.id, apiKey.roomId);

            if (!canAccess) {
                return res
                    .status(403)
                    .send(
                        errorResponse(
                            "User is not in room or he is not admin in this room",
                            userReq.lang
                        )
                    );
            }

            // can't delete because of relationships
            // await prisma.user.delete({ where: { id: apiKey.userId } });

            await prisma.roomUser.deleteMany({
                where: { userId: apiKey.userId, roomId: apiKey.roomId },
            });

            await prisma.apiKey.delete({ where: { id } });

            res.send(successResponse({ deleted: true }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    return router;
};

async function canAccessRoomApiKey(userId: number, roomId: number) {
    const roomsUser = await prisma.roomUser.findFirst({
        where: {
            userId,
            roomId,
        },
    });

    if (!roomsUser) {
        return false;
    }

    if (!roomsUser.isAdmin) {
        // check if it is private room
        const room = await prisma.room.findUnique({
            where: { id: roomId },
            select: { type: true },
        });

        return room?.type === "private";
    }

    return true;
}
