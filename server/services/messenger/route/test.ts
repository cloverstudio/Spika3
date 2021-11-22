import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import { UserRequest } from "../lib/types";
import Utils from "../../../components/utils";
import * as consts from "../../../components/consts";
import l, { error as le } from "../../../components/logger";
import auth from "../lib/auth";
import { InitRouterParams } from "../../types/serviceInterface";
import { successResponse, errorResponse } from "../../../components/response";

export default (params: InitRouterParams) => {
    const router = Router();

    router.get("/", async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        try {
            res.send(successResponse("test", userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.get("/auth", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        try {
            res.send(
                successResponse(
                    {
                        device: userReq.device,
                        user: userReq.user,
                        lang: userReq.lang,
                    },
                    userReq.lang
                )
            );
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.get("/error", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        res.status(400).json(errorResponse(`Error happens`, userReq.lang));
    });

    return router;
};
