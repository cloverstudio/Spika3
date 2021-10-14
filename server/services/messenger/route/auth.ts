import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import amqp from 'amqplib/callback_api';

const prisma = new PrismaClient();


import Utils from "../../../components/utils";
import * as consts from "../../../components/consts";
import l, { error as le } from "../../../components/logger";
import { truncate } from "fs/promises";
import { InitRouterParams } from "../../serviceInterface";

export default ({ rabbitMQConnetion }: InitRouterParams) => {

    const router = Router();

    router.get("/", async (req: Request, res: Response) => {
        try {
            res.status(405).send(`Method not allowed`);
        } catch (e: any) {
            le(e);
            res.status(500).send(`Server error ${e}`);
        }
    });

    router.post("/", async (req: Request, res: Response) => {
        try {

            const telephoneNumber: string = req.body.telephoneNumber as string;
            const deviceId: string = req.body.deviceId as string;
            let isNewUser: boolean = false;

            if (!telephoneNumber)
                return res.status(400).send("Telephone number is required");

            if (!deviceId)
                return res.status(400).send("Device id is required");

            // check existance
            let requestUser = await prisma.user.findFirst({
                where: { telephoneNumber: telephoneNumber },
                select: { id: true },
            });

            if (!requestUser) {
                const newUser = await prisma.user.create({
                    data: {
                        telephoneNumber: telephoneNumber,
                    },
                });

                requestUser = newUser;
                isNewUser = true;

            }
            // is new deive ?
            let requestDevice = await prisma.device.findFirst({
                where: { deviceId: deviceId },
                select: { id: true },
            });

            if (!requestDevice) {

                const newDecvice = await prisma.device.create({
                    data: {
                        deviceId: deviceId,
                        userId: requestUser.id
                    },
                });

                requestDevice = newDecvice;

            }

            // generate token if existed user
            // send SMS if new user
            if (!isNewUser) {

                const newToken = Utils.createToken();
                const expireDate = Utils.getTokenExpireDate();

                requestDevice = await prisma.device.update({
                    where: {
                        id: requestDevice.id
                    },
                    data: {
                        token: newToken,
                        tokenExpiredAt: expireDate
                    },
                });

            } else {

                // send sms

            }

            res.send({
                newUser: isNewUser,
                user: requestUser,
                device: requestDevice
            });

        } catch (e: any) {
            le(e);
            res.status(500).send(`Server error ${e}`);
        }
    });

    router.post("/verifySMS", async (req: Request, res: Response) => {
        try {
            res.send("test");
        } catch (e: any) {
            le(e);
            res.status(500).send(`Server error ${e}`);
        }
    });

    return router;
}

