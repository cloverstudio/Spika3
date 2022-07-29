import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { InitRouterParams } from "../../types/serviceInterface";

import adminAuth from "../lib/adminAuth";
import * as consts from "../../../components/consts";
import { successResponse, errorResponse } from "../../../components/response";
import { UserRequest } from "../../messenger/lib/types";
import moment from "moment";

export default (params: InitRouterParams) => {
    const router = Router();

    router.get("/statHour", adminAuth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const startHour: number = parseInt(req.query.start ? (req.query.start as string) : "") || 0;
        const endHour: number = parseInt(req.query.end ? (req.query.end as string) : "") || 0;
        const startDate: Date = new Date(startHour);
        const endDate: Date = new Date(endHour);
        const startFormatted = startDate.toISOString().slice(0, 19).replace("T", " ");
        const endFormatted = endDate.toISOString().slice(0, 19).replace("T", " ");
        const query = `
        select count( id ) as y , date_format( created_at, '%H' ) as x from message where created_at >= '${startFormatted}' and created_at < '${endFormatted}' group by x`;
        const rawQueryResult: [] = await prisma.$queryRawUnsafe(query);
        const count = rawQueryResult.length;
        res.send(
            successResponse(
                {
                    list: [{ id: "messages per day", color: "#5b5fd8", data: rawQueryResult }],
                    count: count,
                    limit: consts.PAGING_LIMIT,
                },
                userReq.lang
            )
        );
    });

    router.get("/statDay", adminAuth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const startHour: number = parseInt(req.query.start ? (req.query.start as string) : "") || 0;
        const endHour: number = parseInt(req.query.end ? (req.query.end as string) : "") || 0;
        const startDate: Date = new Date(startHour);
        const endDate: Date = new Date(endHour);
        const startFormatted = startDate.toISOString().slice(0, 19).replace("T", " ");
        const endFormatted = endDate.toISOString().slice(0, 19).replace("T", " ");
        console.log("Format: " + startFormatted + " " + endFormatted);
        const query = `
        select count( id ) as y , date_format( created_at, '%d' ) as x from message where created_at >= '${startFormatted}' and created_at < '${endFormatted}' group by x`;
        console.log("QueryString: " + query);
        const rawQueryResult: [] = await prisma.$queryRawUnsafe(query);
        console.log("RawQueryResult: " + rawQueryResult);
        const count = rawQueryResult.length;
        res.send(
            successResponse(
                {
                    list: [{ id: "messages per month", color: "#5b5fd8", data: rawQueryResult }],
                    count: count,
                    limit: consts.PAGING_LIMIT,
                },
                userReq.lang
            )
        );
    });

    return router;
};
