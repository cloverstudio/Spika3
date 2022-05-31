import { Router, Request, Response } from "express";
import l, { error as le } from "../../../components/logger";
import adminTokens, { Token } from "../lib/adminTokens";
import { InitRouterParams } from "../../types/serviceInterface";
import adminAuth from "../lib/adminAuth";
import { successResponse, errorResponse } from "../../../components/response";

export default (params: InitRouterParams) => {
    const router = Router();

    router.get("/check", adminAuth, (req: Request, res: Response) => {
        try {
            return res.send(successResponse("true"));
        } catch (e: any) {
            le(e);
            res.status(500).send(`Server error ${e}`);
        }
    });

    router.get("/", (req: Request, res: Response) => {
        try {
            return res.send("OK");
        } catch (e: any) {
            le(e);
            res.status(500).send(`Server error ${e}`);
        }
    });

    router.post("/", (req: Request, res: Response) => {
        try {
            const username: string = process.env.ADMIN_USERNAME as string;
            const password: string = process.env.ADMIN_PASSWORD as string;
            if (req.body.username !== username || req.body.password !== password)
                return res.status(403).send("Invalid username or password");

            const newToken: Token = adminTokens.newToken();
            res.send(successResponse(newToken));
        } catch (e: any) {
            le(e);
            res.status(500).send(`Server error ${e}`);
        }
    });

    return router;
};
