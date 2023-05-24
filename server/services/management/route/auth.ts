import { Router, Request, Response } from "express";
import { error as le } from "../../../components/logger";
import adminTokens from "../lib/adminTokens";
import { successResponse, errorResponse } from "../../../components/response";
import { InitRouterParams } from "../../types/serviceInterface";

export default ({ redisClient }: InitRouterParams) => {
    const router = Router();

    router.get("/check", async (req: Request, res: Response) => {
        try {
            const token = req.query.token as string;
            if (!token) {
                return res.status(403).send(errorResponse("Missing token"));
            }

            const tokenValid = await redisClient.get(`ADMIN_TOKEN_${token}`);

            if (!tokenValid) {
                return res.status(403).send(errorResponse("Invalid token"));
            }

            return res.send(successResponse("OK"));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`));
        }
    });

    router.post("/", async (req: Request, res: Response) => {
        try {
            const username = process.env.ADMIN_USERNAME as string;
            const password = process.env.ADMIN_PASSWORD as string;
            if (req.body.username !== username || req.body.password !== password)
                return res.status(403).send(errorResponse("Invalid username or password"));

            const newToken = adminTokens.newToken();

            await redisClient.set(`ADMIN_TOKEN_${newToken.token}`, "1", {
                EX: 60 * 60 * 24 * 30, // 30 days
            });

            res.send(successResponse({ token: newToken.token }));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`));
        }
    });

    return router;
};
