import { Router, Request, Response } from "express";

import { error as le } from "../../../components/logger";
import validate from "../../../components/validateMiddleware";
import * as yup from "yup";
import { successResponse, errorResponse } from "../../../components/response";
import auth from "../lib/auth";
import { UserRequest } from "../lib/types";
import sanitize from "../../../components/sanitize";
import prisma from "../../../components/prisma";

const updateSchema = yup.object().shape({
    body: yup.object().shape({
        pushToken: yup.string().strict(),
    }),
});

export default (): Router => {
    const router = Router();

    router.get("/", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        try {
            res.send(successResponse({ device: sanitize(userReq.device).device() }));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.put("/", auth, validate(updateSchema), async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const id = userReq.device.id;

        try {
            const { pushToken } = req.body;

            const device = await prisma.device.update({
                where: { id },
                data: {
                    pushToken,
                },
            });

            res.send(successResponse({ device: sanitize(device).device() }));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    return router;
};
