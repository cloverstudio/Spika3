import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import Utils from "../../../components/utils";
import * as consts from "../../../components/consts";
import l, { error as le } from "../../../components/logger";

import { InitRouterParams } from "../../types/serviceInterface";

export default (params: InitRouterParams) => {

    const router = Router();

    router.get("/", async (req: Request, res: Response) => {
        try {
            res.send("test");
        } catch (e: any) {
            le(e);
            res.status(500).send(`Server error ${e}`);
        }
    });

    return router;

}


