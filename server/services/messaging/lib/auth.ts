import { Request, Response } from "express";
import * as constants from "../../../components/consts";

import { UserRequest } from "./types";
import prisma from "../../../components/prisma";
import { error as le } from "../../../components/logger";
import Utils from "../../../components/utils";

export default async (
    req: Request,
    res: Response,
    next: () => void
): Promise<Response<any, Record<string, any>> | void> => {
    try {
        const accessToken =
            (req.cookies[constants.ACCESS_TOKEN] as string) ||
            (req.headers[constants.ACCESS_TOKEN_NEW] as string) ||
            (req.headers[constants.ACCESS_TOKEN] as string);

        if (!accessToken) {
            Utils.clearAuthCookies(req, res, req.headers.origin);
            return res.status(401).send("No access token");
        }

        const apiKey = await prisma.apiKey.findFirst({
            where: {
                token: accessToken,
            },
        });

        if (!apiKey) {
            Utils.clearAuthCookies(req, res, req.headers.origin);
            return res.status(401).send("Invalid access token");
        }

        const bot = await prisma.user.findUnique({
            where: {
                id: apiKey.userId,
            },
        });

        if (!bot) {
            Utils.clearAuthCookies(req, res, req.headers.origin);
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
