import { Router, Request, Response } from "express";
import { error as le } from "../../../components/logger";
import adminTokens from "../lib/adminTokens";
import { successResponse, errorResponse } from "../../../components/response";
import dayjs from "dayjs";

export default () => {
    const router = Router();

    router.get("/check", (req: Request, res: Response) => {
        try {
            const token = req.query.token as string;
            if (!token) {
                return res.status(403).send(errorResponse("Missing token"));
            }

            const tokenObj = adminTokens.tokens.find((item) => item.token === token);

            if (!tokenObj) {
                return res.status(403).send(errorResponse("Invalid token"));
            }

            if (tokenObj.expireDate < dayjs().unix()) {
                return res.status(403).send(errorResponse("Token expired"));
            }

            return res.send(successResponse("OK"));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`));
        }
    });

    router.get("/", (req: Request, res: Response) => {
        try {
            return res.send("OK");
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`));
        }
    });

    router.post("/", (req: Request, res: Response) => {
        try {
            const username = process.env.ADMIN_USERNAME as string;
            const password = process.env.ADMIN_PASSWORD as string;
            if (req.body.username !== username || req.body.password !== password)
                return res.status(403).send(errorResponse("Invalid username or password"));

            const newToken = adminTokens.newToken();

            res.send(successResponse({ token: newToken.token }));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`));
        }
    });

    return router;
};
