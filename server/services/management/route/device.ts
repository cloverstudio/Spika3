import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import adminAuth from "../lib/adminAuth";
import Utils from "../../../components/utils";
import * as consts from "../../../components/consts";

import l, { error as le } from "../../../components/logger";

import { InitRouterParams } from "../../types/serviceInterface";

export default (params: InitRouterParams) => {
    const router = Router();

    router.post("/", adminAuth, async (req: Request, res: Response) => {
        try {
            const userId: number = parseInt(req.body.userId);
            const deviceId: string = req.body.deviceId;
            const type: string = req.body.type;
            const osName: string = req.body.osName;
            const appVersion: number = req.body.appVersion ? parseInt(req.body.appVersion) : null;
            const token: string = req.body.token;
            const pushToken: string = req.body.pushToken;

            if (Utils.isEmptyNumber(userId)) return res.status(400).send("userId is required");
            if (!deviceId) return res.status(400).send("deviceId is required");
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

            return res.send(newDevice);
        } catch (e: any) {
            le(e);
            res.status(500).send(`Server error ${e}`);
        }
    });

    /**
     * TODO: impliment order
     */
    router.get("/", adminAuth, async (req: Request, res: Response) => {
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

            res.json({
                list: devices,
                count: count,
                limit: consts.PAGING_LIMIT,
            });
        } catch (e: any) {
            le(e);
            res.status(500).send(`Server error ${e}`);
        }
    });

    router.get("/:deviceId", adminAuth, async (req: Request, res: Response) => {
        try {
            const deviceId: number = parseInt(req.params.deviceId);

            // check existance
            const device = await prisma.device.findFirst({
                where: {
                    id: deviceId,
                },
            });

            if (!device) return res.status(404).send("wrong device id");

            return res.send(device);
        } catch (e: any) {
            le(e);
            res.status(500).send(`Server error ${e}`);
        }
    });

    router.put("/:deviceId", adminAuth, async (req: Request, res: Response) => {
        try {
            const idOfDevice: number = parseInt(req.params.deviceId);

            const userId: number = parseInt(req.body.userId);
            const deviceId: string = req.body.deviceId;
            const type: string = req.body.type;
            const osName: string = req.body.osName;
            const appVersion: number = parseInt(req.body.appVersion);
            const token: string = req.body.token;
            const pushToken: string = req.body.pushToken;

            // check existance
            const device = await prisma.device.findFirst({
                where: {
                    id: idOfDevice,
                },
            });

            if (!device) return res.status(404).send("wrong device id");

            const updateValues: any = {};
            if (type) updateValues.type = type;
            if (osName) updateValues.osName = osName;
            if (appVersion) updateValues.appVersion = appVersion;
            if (token) updateValues.token = token;
            if (pushToken) updateValues.pushToken = pushToken;

            if (Object.keys(updateValues).length == 0)
                return res.status(400).send("No params to update");

            const updateDevice = await prisma.device.update({
                where: { id: idOfDevice },
                data: updateValues,
            });
            return res.send(updateDevice);
        } catch (e: any) {
            le(e);
            res.status(500).send(`Server error ${e}`);
        }
    });

    router.delete("/:deviceId", adminAuth, async (req: Request, res: Response) => {
        try {
            const idOfDevice: number = parseInt(req.params.deviceId);
            // check existance
            const device = await prisma.device.findFirst({
                where: {
                    id: idOfDevice,
                },
            });

            if (!device) return res.status(404).send("wrong device id");

            const deleteResult = await prisma.device.delete({
                where: { id: idOfDevice },
            });

            return res.send("OK");
        } catch (e: any) {
            le(e);
            res.status(500).send(`Server error ${e}`);
        }
    });

    return router;
};
