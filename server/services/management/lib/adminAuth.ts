import { Request, Response } from "express";

import * as constants from "../../../components/consts";
import { createClient } from "redis";

export default (redisClient: ReturnType<typeof createClient>) =>
    async (req: Request, res: Response, next: () => void) => {
        if (!req.headers[constants.ADMIN_ACCESS_TOKEN]) {
            return res.status(403).send("Invalid access token");
        }

        const tokenValid = await redisClient.get(
            `ADMIN_TOKEN_${req.headers[constants.ADMIN_ACCESS_TOKEN] as string}`
        );

        if (!tokenValid) {
            return res.status(403).send("Invalid access token");
        }

        next();
    };
