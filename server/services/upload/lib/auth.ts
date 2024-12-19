import { Request, Response } from "express";
import dayjs from "dayjs";
import * as constants from "../../../components/consts";
import { createClient } from "redis";

import { UserRequest } from "./types";
import prisma from "../../../components/prisma";
import { error as le } from "../../../components/logger";
import Utils from "../../../components/utils";

export default (redisClient: ReturnType<typeof createClient>) =>
    async (req: Request, res: Response, next: () => void) => {
        try {
            const accessToken =
                (req.cookies[constants.ACCESS_TOKEN] as string) ||
                (req.cookies[constants.ACCESS_TOKEN] as string) ||
                (req.headers[constants.ACCESS_TOKEN_NEW] as string) ||
                (req.headers[constants.ACCESS_TOKEN] as string);

            if (!accessToken) {
                Utils.clearAuthCookies(req, res, req.headers.origin);
                return res.status(401).send("No access token");
            }

            const osName = req.headers["os-name"] as string;
            const osVersion = req.headers["os-version"] as string;
            const deviceName = req.headers["device-name"] as string;
            const appVersion = req.headers["app-version"] as string;
            const lang: string = (req.headers["lang"] as string) || "en";
            let isAdmin: boolean = false;

            const device = await prisma.device.findFirst({
                where: {
                    token: accessToken,
                },
                include: {
                    user: true,
                },
            });

            isAdmin = await isManagementUpload(req, redisClient);
            //this API is shared for messenger and management
            if (!device && !isAdmin) return res.status(401).send("Invalid access token");

            const tokenExpiredAtTS = +dayjs(device.tokenExpiredAt);
            const now = +dayjs();

            if (now > tokenExpiredAtTS) return res.status(401).send("Access token expired");

            const userRequest: UserRequest = req as UserRequest;

            userRequest.user = device.user;
            delete device.user;
            userRequest.device = device;
            userRequest.lang = lang;

            // update device is there is a change
            if (
                device.osName !== osName ||
                device.osVersion !== osVersion ||
                device.deviceName !== deviceName ||
                device.appVersion !== appVersion
            ) {
                const updateData: any = {};
                if (osName) updateData.osName = osName;
                if (osVersion) updateData.osVersion = osVersion;
                if (deviceName) updateData.deviceName = deviceName;
                if (appVersion) updateData.appVersion = appVersion;

                if (Object.keys(updateData).length > 0) {
                    const newDevice = await prisma.device.update({
                        where: { id: device.id },
                        data: { ...updateData, modifiedAt: new Date() },
                    });

                    userRequest.device = newDevice;
                }
            }

            next();
        } catch (e) {
            le(e);
            res.status(500).send(`Server error ${e}`);
        }
    };

async function isManagementUpload(req: Request, redisClient: ReturnType<typeof createClient>) {
    const adminToken = await redisClient.get(
        `ADMIN_TOKEN_${(req.headers[constants.ADMIN_ACCESS_TOKEN] as string) || (req.cookies[constants.ACCESS_TOKEN] as string)}`,
    );

    if (!adminToken) {
        return false;
    }
    return true;
}
