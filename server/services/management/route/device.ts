import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import adminAuth from "../lib/adminAuth";
import Utils from "../../../components/utils";
import * as consts from "../../../components/consts";

import l, { error as le } from "../../../components/logger";

import { InitRouterParams } from "../../types/serviceInterface";
import { successResponse, errorResponse } from "../../../components/response";
import { UserRequest } from "../../messenger/lib/types";
import { Device } from "@prisma/client";

export default (params: InitRouterParams) => {
    const router = Router();

    router.post("/", adminAuth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        try {
            const userId: number = parseInt(req.body.userId);
            const deviceId: string = req.body.deviceId;
            const type: string = req.body.type;
            const osName: string = req.body.osName;
            const appVersion: number = req.body.appVersion ? parseInt(req.body.appVersion) : null;
            const token: string = req.body.token;
            const pushToken: string = req.body.pushToken;

            if (Utils.isEmptyNumber(userId))
                return res.status(400).send(errorResponse(`User id is required`, userReq.lang));
            if (!deviceId)
                return res.status(400).send(errorResponse(`Device id is required`, userReq.lang));

            const device = await prisma.device.findFirst({
                where: {
                    deviceId: deviceId,
                },
            });

            if (device != null)
                return res
                    .status(400)
                    .send(errorResponse(`Device id already exists`, userReq.lang));

            const newDevice = await prisma.device.create({
                data: {
                    userId: userId,
                    deviceId: deviceId,
                    type: type,
                    osName: osName,
                    appVersion: appVersion,
                    token: token,
                    pushToken: pushToken,
                },
            });

            return res.send(successResponse({ device: newDevice }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    /**
     * TODO: impliment order
     */
    router.get("/", adminAuth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const page: number = parseInt(req.query.page ? (req.query.page as string) : "") || 0;
        const userId: number = parseInt(req.query.userId ? (req.query.userId as string) : "") || 0;
        const clause = userId == 0 ? {} : { userId: userId };
        try {
            const devices = await prisma.device.findMany({
                where: clause,
                orderBy: [
                    {
                        createdAt: "asc",
                    },
                ],
                skip: consts.PAGING_LIMIT * page,
                take: consts.PAGING_LIMIT,
            });
            const count = userId == 0 ? await prisma.device.count() : devices.length;

            res.send(
                successResponse(
                    {
                        list: devices,
                        count: count,
                        limit: consts.PAGING_LIMIT,
                    },
                    userReq.lang
                )
            );
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.get("/:deviceId", adminAuth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        try {
            const deviceId: number = parseInt(req.params.deviceId);
            // check existance
            const device = await prisma.device.findFirst({
                where: {
                    id: deviceId,
                },
            });

            if (!device)
                return res.status(404).send(errorResponse(`Wrong device id`, userReq.lang));

            return res.send(successResponse({ device }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.put("/:deviceId", adminAuth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        try {
            const idOfDevice: number = parseInt(req.params.deviceId);
            const userId: number = parseInt(req.body.userId);
            const deviceId: string = req.body.deviceId;
            const type: string = req.body.type;
            const osName: string = req.body.osName;
            const appVersion: number = parseInt(req.body.appVersion);
            const token: string = req.body.token;
            const pushToken: string = req.body.pushToken;
            const device: Device = await prisma.device.findFirst({
                where: {
                    id: idOfDevice,
                },
            });
            const deviceCheckUnique: Device = await prisma.device.findFirst({
                where: {
                    deviceId: deviceId,
                },
            });

            if (!device)
                return res.status(404).send(errorResponse(`Wrong device id`, userReq.lang));

            if (deviceCheckUnique != null) {
                if (device.id != deviceCheckUnique.id)
                    return res
                        .status(404)
                        .send(errorResponse(`Device id already in use`, userReq.lang));
            }
            const updateValues: any = {};
            if (type) updateValues.type = type;
            if (osName) updateValues.osName = osName;
            if (appVersion) updateValues.appVersion = appVersion;
            if (token) updateValues.token = token;
            if (pushToken) updateValues.pushToken = pushToken;

            if (Object.keys(updateValues).length == 0)
                return res.status(400).send(errorResponse(`Nothing to update`, userReq.lang));

            const updateDevice = await prisma.device.update({
                where: { id: idOfDevice },
                data: updateValues,
            });
            return res.send(successResponse({ device: updateDevice }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.delete("/:deviceId", adminAuth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        try {
            const idOfDevice: number = parseInt(req.params.deviceId);
            // check existance
            const device = await prisma.device.findFirst({
                where: {
                    id: idOfDevice,
                },
            });

            if (!device)
                return res.status(404).send(errorResponse(`Wrong device id`, userReq.lang));

            const deleteResult = await prisma.device.delete({
                where: { id: idOfDevice },
            });
            return res.send(successResponse("OK", userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    return router;
};
