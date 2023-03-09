import { Request, Response } from "express";
import * as constants from "../../../components/consts";

import { UserRequest } from "./types";
import prisma from "../../../components/prisma";
import { error as le } from "../../../components/logger";

export default async (
    req: Request,
    res: Response,
    next: () => void
): Promise<Response<any, Record<string, any>> | void> => {
    try {
        const accessToken =
            (req.headers[constants.ACCESS_TOKEN_NEW] as string) ||
            (req.headers[constants.ACCESS_TOKEN] as string);
        if (!accessToken) return res.status(401).send("No access token");

        const apiKey = await prisma.apiKey.findFirst({
            where: {
                token: accessToken,
            },
        });

        if (!apiKey) {
            return res.status(401).send("Invalid access token");
        }

        const bot = await prisma.user.findUnique({
            where: {
                id: apiKey.userId,
            },
        });

        if (!bot) {
            return res.status(401).send("Invalid access token");
        }

        const userRequest: UserRequest = req as UserRequest;

        userRequest.user = bot;
        next();
    } catch (e) {
        le(e);
        res.status(500).send(`Server error ${e}`);
    }
};
