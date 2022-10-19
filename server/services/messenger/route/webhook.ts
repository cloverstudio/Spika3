import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import { UserRequest } from "../lib/types";
import * as yup from "yup";
import validate from "../../../components/validateMiddleware";

import { error as le } from "../../../components/logger";
import auth from "../lib/auth";
import { InitRouterParams } from "../../types/serviceInterface";
import { successResponse, errorResponse } from "../../../components/response";
import sanitize from "../../../components/sanitize";
import utils from "../../../components/utils";

const postWebhookSchema = yup.object().shape({
    body: yup.object().shape({
        url: yup.string().strict(),
    }),
});

export default ({}: InitRouterParams): Router => {
    const router = Router();

    router.post(
        "/roomId/:roomId",
        auth,
        validate(postWebhookSchema),
        async (req: Request, res: Response) => {
            const userReq: UserRequest = req as UserRequest;

            try {
                const roomId = parseInt((req.params.roomId as string) || "");
                const url = req.body.url as string;

                const canAccess = await canAccessRoomWebhooks(userReq.user.id, roomId);

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

                const webhook = await prisma.webhook.create({
                    data: { roomId, url, verifySignature: utils.randomString(16) },
                });

                res.send(successResponse({ webhook: sanitize(webhook).webhook() }, userReq.lang));
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

            const canAccess = await canAccessRoomWebhooks(userReq.user.id, roomId);

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

            const webhooks = await prisma.webhook.findMany({ where: { roomId } });

            res.send(
                successResponse(
                    { webhooks: webhooks.map((n) => sanitize(n).webhook()) },
                    userReq.lang
                )
            );
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.put("/:id", auth, validate(postWebhookSchema), async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        try {
            const { url } = req.body;
            const id = parseInt(req.params.id || "");

            const webhook = await prisma.webhook.findUnique({ where: { id } });

            if (!webhook) {
                return res.status(404).send(errorResponse("Not found", userReq.lang));
            }

            const canAccess = await canAccessRoomWebhooks(userReq.user.id, webhook.roomId);

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

            const updated = await prisma.webhook.update({
                where: { id },
                data: { url },
            });

            res.send(successResponse({ webhook: sanitize(updated).webhook() }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.delete("/:id", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        try {
            const id = parseInt(req.params.id || "");

            const webhook = await prisma.webhook.findUnique({ where: { id } });

            if (!webhook) {
                return res.status(404).send(errorResponse("Not found", userReq.lang));
            }

            const canAccess = await canAccessRoomWebhooks(userReq.user.id, webhook.roomId);

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

            await prisma.webhook.delete({ where: { id } });

            res.send(successResponse({ deleted: true }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    return router;
};

async function canAccessRoomWebhooks(userId: number, roomId: number) {
    const roomsUser = await prisma.roomUser.findFirst({
        where: {
            userId,
            roomId,
        },
    });

    console.log({ roomsUser });

    if (!roomsUser) {
        return false;
    }

    if (!roomsUser.isAdmin) {
        return false;
    }

    return true;
}
