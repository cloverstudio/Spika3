import { Request, Response, NextFunction } from "express";
import { User, Device } from "@prisma/client";
import { error as le } from "./logger";
import { errorResponse } from "./response";
import * as constants from "./consts";
import { createClient } from "redis";
import * as Constants from "./consts";
interface UserRequest extends Request {
    user: User;
    device: Device;
    lang: string;
}

//token bucket rate limiter
export default function rateLimiter(redisClient: ReturnType<typeof createClient>) {
    return async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        const userReq: UserRequest = req as UserRequest;
        const accessToken = req.cookies[constants.ACCESS_TOKEN] as string;
        try {
            if (!accessToken) return next();
            const tokenBucket = await redisClient.get(
                `${Constants.TOKEN_BUCKET_PREFIX}${accessToken}`,
            );

            if (!tokenBucket) {
                await redisClient.set(`${Constants.TOKEN_BUCKET_PREFIX}${accessToken}`, 1, {
                    EX: Constants.TOKEN_BUCKET_EXPIRY_TIME,
                    NX: true,
                });
            } else {
                if (parseInt(tokenBucket) >= Constants.TOKEN_BUCKET_LIMIT) {
                    return res.status(429).send(errorResponse("Too many requests"));
                }
                await redisClient.incr(`${Constants.TOKEN_BUCKET_PREFIX}${accessToken}`);
                await redisClient.expire(
                    `${Constants.TOKEN_BUCKET_PREFIX}${accessToken}`,
                    Constants.TOKEN_BUCKET_EXPIRY_TIME,
                );
            }

            return next();
        } catch (err: any) {
            le(err);
            return res.status(500).json(errorResponse(`Server error ${err}`));
        }
    };
}
