import { Router, Request, Response } from "express";
import { PrismaClient, User } from "@prisma/client";

import { error as le } from "../../../components/logger";
import { successResponse, errorResponse } from "../../../components/response";
import auth from "../lib/auth";
import { UserRequest } from "../lib/types";
import sanitize from "../../../components/sanitize";

const prisma = new PrismaClient();

export default (): Router => {
    const router = Router();

    router.get("/:id", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        try {
            const id = parseInt((req.params.id as string) || "");

            let user: User;

            if (process.env["TEAM_MODE"]) {
                user = await prisma.user.findFirst({
                    where: {
                        id,
                    },
                });
            } else {
                const userContact = await prisma.contact.findFirst({
                    where: {
                        user: userReq.user,
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

    return router;
};
