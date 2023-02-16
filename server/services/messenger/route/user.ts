import { Router, Request, Response } from "express";
import { User } from "@prisma/client";

import { error as le } from "../../../components/logger";
import { successResponse, errorResponse } from "../../../components/response";
import auth from "../lib/auth";
import { UserRequest } from "../lib/types";
import sanitize from "../../../components/sanitize";
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

        try {
            if (isNaN(timestamp)) {
                return res
                    .status(400)
                    .send(errorResponse("timestamp must be number", userReq.lang));
            }

            let users: User[];

            if (+process.env["TEAM_MODE"]) {
                users = await prisma.user.findMany({
                    where: {
                        modifiedAt: { gt: new Date(timestamp) },
                    },
                });
            } else {
                const userContact = await prisma.contact.findMany({
                    where: {
                        userId: userReq.user.id,
                        contact: {
                            modifiedAt: { gt: new Date(timestamp) },
                        },
                    },
                    include: {
                        contact: true,
                    },
                });

                users = userContact.map((uc) => uc.contact);
            }

            res.send(
                successResponse({ users: users.map((user) => sanitize(user).user()) }, userReq.lang)
            );
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    return router;
};
