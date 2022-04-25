import { Request, Response } from "express";
import dayjs from "dayjs";
import * as constants from "../../../components/consts";

import { UserRequest } from "./types";
import prisma from "../../../components/prisma";
import { error as le } from "../../../components/logger";

export default async (req: Request, res: Response, next: () => void) => {
    try {
        if (!req.headers[constants.ACCESS_TOKEN] && !req.query[constants.ACCESS_TOKEN]) {
            return res.status(403).send("Invalid access token");
        }

        const osName = req.headers["os-name"] as string;
        const osVersion = req.headers["os-version"] as string;
        const deviceName = req.headers["device-name"] as string;
        const appVersion: number = parseInt(req.headers["app-version"] as string);
        const lang: string = (req.headers["lang"] as string) || "en";

        const accessToken: string =
            (req.headers[constants.ACCESS_TOKEN] as string) ||
            (req.query[constants.ACCESS_TOKEN] as string);
        const device = await prisma.device.findFirst({
            where: {
                token: accessToken,
            },
            include: {
                user: true,
            },
        });

        if (!device) return res.status(403).send("Invalid access token");

        const tokenExpiredAtTS: number = dayjs(device.tokenExpiredAt).unix();
        const now: number = dayjs().unix();

        if (now - tokenExpiredAtTS > constants.TOKEN_EXPIRED)
            return res.status(403).send("Token is expired");

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
                    data: updateData,
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
