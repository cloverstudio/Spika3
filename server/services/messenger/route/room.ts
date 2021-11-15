import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

import { UserRequest } from "../lib/types";
import l, { error as le } from "../../../components/logger";
import * as Constants from "../../../components/consts";

import auth from "../lib/auth";
import * as yup from "yup";
import validate from "../lib/validate";

const prisma = new PrismaClient();

const postRoomSchema = yup.object().shape({
    body: yup.object().shape({
        name: yup.string().strict(),
        avatarUrl: yup.string().strict(),
        type: yup.string().strict(),
        userIds: yup.array().of(yup.number().moreThan(0)),
        adminUserIds: yup.array().of(yup.number().moreThan(0)),
    }),
});

export default (): Router => {
    const router = Router();

    router.post("/", auth, validate(postRoomSchema), async (req: Request, res: Response) => {
        try {
            const userReq: UserRequest = req as UserRequest;

            res.send("ok");
        } catch (e: any) {
            le(e);
            res.status(500).send(`Server error ${e}`);
        }
    });

    router.patch("/:id", auth, async (req: Request, res: Response) => {
        try {
            const userReq: UserRequest = req as UserRequest;
        } catch (e: any) {
            le(e);
            res.status(500).send(`Server error ${e}`);
        }
    });

    router.delete("/:id", auth, async (req: Request, res: Response) => {
        try {
            const userReq: UserRequest = req as UserRequest;
        } catch (e: any) {
            le(e);
            res.status(500).send(`Server error ${e}`);
        }
    });

    return router;
};
