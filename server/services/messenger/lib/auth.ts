import { Request, Response } from "express";
import dayjs from "dayjs";
import * as constants from "../../../components/consts";

import { UserRequest } from "./types";
import prisma from "../../../components/prisma";
import { error as le } from "../../../components/logger";

export default async (
    req: Request,
    res: Response,
    next: () => void
): Promise<Response<any, Record<string, any>> | void> => {
    try {
        const accessToken = req.headers[constants.ACCESS_TOKEN] as string;
        if (!accessToken) return res.status(401).send("No access token");

        const osName = req.headers["os-name"] as string;
        const osVersion = req.headers["os-version"] as string;
        const deviceName = req.headers["device-name"] as string;
        const appVersion = req.headers["app-version"] as string;
        const deviceType = req.headers["device-type"] as string;
        const lang = (req.headers["lang"] as string) || "en";

        const device = await prisma.device.findFirst({
            where: {
                token: accessToken,
            },
            include: {
                user: true,
            },
        });

        if (!device) return res.status(401).send("Invalid access token");

        const tokenExpiredAtTS = +dayjs(device.tokenExpiredAt);
        const now = +dayjs();

        if (now > tokenExpiredAtTS) return res.status(401).send("Expired access token");
        if (!device.user) return res.status(401).send("User not found");
        if (!device.user.verified) return res.status(401).send("User is not verified");

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
            device.appVersion !== appVersion ||
            device.type !== deviceType
        ) {
            const updateData: any = {};
            if (osName) updateData.osName = osName;
            if (osVersion) updateData.osVersion = osVersion;
            if (deviceName) updateData.deviceName = deviceName;
            if (appVersion) updateData.appVersion = appVersion;
            if (deviceType) updateData.type = deviceType;

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
