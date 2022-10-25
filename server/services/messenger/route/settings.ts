import { Router, Request, Response } from "express";

import { UserRequest } from "../lib/types";
import { error as le } from "../../../components/logger";
import { successResponse, errorResponse } from "../../../components/response";

export default () => {
    const router = Router();

    router.get("/", async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        try {
            res.send(successResponse({ teamMode: !!+process.env["TEAM_MODE"] }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    return router;
};
