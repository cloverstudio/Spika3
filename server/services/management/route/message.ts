import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { InitRouterParams } from "../../types/serviceInterface";

export default (params: InitRouterParams) => {
    const router = Router();

    return router;
};
