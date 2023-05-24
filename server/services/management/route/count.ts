import { Router, Request, Response } from "express";
import adminAuth from "../lib/adminAuth";
import { error as le } from "../../../components/logger";
import { successResponse, errorResponse } from "../../../components/response";
import { UserRequest } from "../../messenger/lib/types";
import prisma from "../../../components/prisma";
import { InitRouterParams } from "../../types/serviceInterface";

export default ({ redisClient }: InitRouterParams) => {
    const router = Router();

    router.get("/", adminAuth(redisClient), async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        try {
            const users = await prisma.user.count({
                where: {
                    isBot: false,
                    deleted: false,
                },
            });
            const groups = await prisma.room.count({
                where: {
                    type: "group",
                    deleted: false,
                },
            });

            res.send(successResponse({ users, groups }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    return router;
};
