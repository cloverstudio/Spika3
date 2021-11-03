import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import amqp from 'amqplib/callback_api';

const prisma = new PrismaClient();


import Utils from "../../../components/utils";
import * as Constants from "../../../components/consts";
import l, { error as le } from "../../../components/logger";
import { truncate } from "fs/promises";
import { InitRouterParams } from "../../types/serviceInterface";
import { SendSMSPayload } from "../../types/queuePayloadTypes";
import { veryficationCodeSMS } from "../../../components/string";
import { tsNullKeyword } from "@babel/types";


export default ({ rabbitMQChannel }: InitRouterParams) => {

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
            const telephoneNumberHashed: string = req.body.telephoneNumberHashed as string;
            const countryCode: string = req.body.countryCode as string;
            const deviceId: string = req.body.deviceId as string;
            let isNewUser: boolean = false;
            let verificationCode: string = null;

            if (!telephoneNumber)
                return res.status(400).send("Telephone number is required");

            if (!telephoneNumberHashed)
                return res.status(400).send("Hashed telephone number is required");

            if (!countryCode)
                return res.status(400).send("Country code is required");

            if (!deviceId)
                return res.status(400).send("Device id is required");

            // check existance
            let requestUser = await prisma.user.findFirst({
                where: { telephoneNumber: telephoneNumber },
                select: { id: true, verified: true, telephoneNumber: true, telephoneNumberHashed: true, createdAt: true, modifiedAt: true },
            });

            if (!requestUser) {

                verificationCode = process.env.IS_TEST === "1" ?
                    Constants.BACKDOOR_VERIFICATION_CODE : Utils.randomNumber(6);

                l(`Verification code ${verificationCode}, device id ${deviceId}`);

                const newUser = await prisma.user.create({
                    data: {
                        telephoneNumber: telephoneNumber,
                        telephoneNumberHashed: telephoneNumberHashed,
                        countryCode: countryCode,
                        verificationCode: verificationCode
                    }
                });

                requestUser = newUser;
                isNewUser = true;

            } else if (requestUser.verified === false) {

                // send sms again
                l("Resend verification code");

                verificationCode = process.env.IS_TEST === "1" ?
                    Constants.BACKDOOR_VERIFICATION_CODE : Utils.randomNumber(6);

                const newUser = await prisma.user.update({
                    where: {
                        id: requestUser.id
                    },
                    data: {
                        verificationCode: verificationCode,
                        telephoneNumberHashed: telephoneNumberHashed,
                        countryCode: countryCode,
                    },
                });

                requestUser = newUser;
                isNewUser = true;

            } else {
                // re-login
                const newUser = await prisma.user.update({
                    where: {
                        id: requestUser.id
                    },
                    data: {
                        verificationCode: verificationCode,
                        verified: false
                    },
                });
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
            }

            // send sms
            const payload: SendSMSPayload = {
                telephoneNumber: telephoneNumber,
                content: veryficationCodeSMS({ verificationCode })
            }

            rabbitMQChannel.sendToQueue(Constants.QUEUE_SMS, Buffer.from(JSON.stringify(payload)))

            res.send({
                newUser: isNewUser,
                user: {
                    id: requestUser.id,
                    telephoneNumber: requestUser.telephoneNumber,
                    telephoneNumberHashed: requestUser.telephoneNumberHashed,
                    createdAt: requestUser.createdAt,
                    modifiedAt: requestUser.modifiedAt
                },
                device: {
                    id: requestDevice.id
                }

            });

        } catch (e: any) {
            le(e);
            res.status(500).send(`Server error ${e}`);
        }
    });

    router.post("/verify", async (req: Request, res: Response) => {
        try {

            const verificationCode: string = req.body.code as string;
            const deviceId: string = req.body.deviceId as string;

            if (!verificationCode)
                return res.status(400).send("Verification code is required");

            if (!deviceId)
                return res.status(400).send("DeviceId is required");

            l(`verify ${verificationCode} deviceId ${deviceId}`);

            let requestUser = await prisma.user.findFirst({
                where: { verificationCode: verificationCode },
                select: { id: true, verified: true, telephoneNumber: true, createdAt: true, modifiedAt: true },
            });

            l("request user", requestUser);

            if (!requestUser)
                return res.status(403).send("Verification code is invalid");

            let requestDevice = await prisma.device.findFirst({
                where: {
                    deviceId: deviceId,
                    userId: requestUser.id
                }
            });

            if (!requestDevice)
                return res.status(403).send("Invlid device id");

            await prisma.user.update({
                where: {
                    id: requestUser.id
                },
                data: {
                    verificationCode: "",
                    verified: true
                }
            });

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

            res.send({
                user: {
                    id: requestUser.id,
                    telephoneNumber: requestUser.telephoneNumber,
                    createdAt: requestUser.createdAt,
                    modifiedAt: requestUser.modifiedAt
                },
                device: requestDevice
            });

        } catch (e: any) {
            le(e);
            res.status(500).send(`Server error ${e}`);
        }
    });

    return router;
}

