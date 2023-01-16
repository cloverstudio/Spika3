import { Router, Request, Response } from "express";
import { User } from "@prisma/client";

import Utils from "../../../components/utils";
import * as Constants from "../../../components/consts";
import l, { error as le } from "../../../components/logger";
import { InitRouterParams } from "../../types/serviceInterface";
import { SendSMSPayload } from "../../types/queuePayloadTypes";
import { verificationCodeSMS } from "../../../components/string";
import validate from "../../../components/validateMiddleware";
import * as yup from "yup";
import { successResponse, errorResponse } from "../../../components/response";
import sanitize from "../../../components/sanitize";
import * as constants from "../lib/constants";
import prisma from "../../../components/prisma";

const authSchema = yup.object().shape({
    body: yup.object().shape({
        telephoneNumber: yup.string().required(),
        deviceId: yup.string().required(),
    }),
});

const verifySchema = yup.object().shape({
    body: yup.object().shape({
        code: yup.string().required(),
        deviceId: yup.string().required(),
    }),
});

export default ({ rabbitMQChannel }: InitRouterParams): Router => {
    const router = Router();

    router.get("/", async (req: Request, res: Response) => {
        try {
            res.status(405).send(errorResponse(`Method not allowed`));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`));
        }
    });

    router.post("/", validate(authSchema), async (req: Request, res: Response) => {
        try {
            const telephoneNumber = req.body.telephoneNumber as string;
            const telephoneNumberHashed = Utils.sha256(telephoneNumber);
            const deviceId = req.body.deviceId as string;
            const osName = (req.headers["os-name"] || "") as string;
            const deviceType: string = req.headers["device-type"] as string;

            let isNewUser = false;

            const registeredDevice = await prisma.device.findFirst({
                where: { deviceId },
                include: {
                    user: true,
                },
            });

            if (
                registeredDevice &&
                registeredDevice.user &&
                registeredDevice.user.verified &&
                registeredDevice.user.telephoneNumber !== telephoneNumber &&
                deviceType !== constants.DEVICE_TYPE_BROWSER
            ) {
                return res
                    .status(403)
                    .send(errorResponse(`There is already phone number tied to this device`));
            }

            const verificationCode =
                process.env.IS_TEST === "1"
                    ? Constants.BACKDOOR_VERIFICATION_CODE
                    : Utils.randomNumber(6);

            let requestUser = await prisma.user.findFirst({
                where: { telephoneNumber },
            });

            if (!requestUser) {
                requestUser = await prisma.user.create({
                    data: {
                        telephoneNumber,
                        telephoneNumberHashed,
                        verificationCode,
                    },
                });

                isNewUser = true;
            } else {
                isNewUser = !requestUser.displayName;

                requestUser = await prisma.user.update({
                    where: {
                        id: requestUser.id,
                    },
                    data: {
                        verificationCode,
                        verified: false,
                    },
                });
            }

            l(`Verification code ${verificationCode}, device id ${deviceId}`);

            // is new device ?
            let requestDevice = await prisma.device.findFirst({
                where: { deviceId },
            });

            // check the user already has browser device
            if (deviceType === constants.DEVICE_TYPE_BROWSER) {
                requestDevice = await prisma.device.findFirst({
                    where: {
                        userId: requestUser.id,
                        type: constants.DEVICE_TYPE_BROWSER,
                    },
                });
            }

            if (!requestDevice) {
                requestDevice = await prisma.device.create({
                    data: {
                        deviceId,
                        userId: requestUser.id,
                        osName: req.headers["os-name"] as string,
                        osVersion: req.headers["os-version"] as string,
                        deviceName: req.headers["device-name"] as string,
                        appVersion: req.headers["app-version"] as string,
                        type: deviceType,
                    },
                });
            } else {
                // expire token if existing device
                // If there is device already registered the user took the device
                requestDevice = await prisma.device.update({
                    where: {
                        id: requestDevice.id,
                    },
                    data: {
                        tokenExpiredAt: new Date(),
                        userId: requestUser.id,
                    },
                });
            }

            const SMSPayload: SendSMSPayload = {
                telephoneNumber,
                content: verificationCodeSMS({ verificationCode, osName }),
            };

            rabbitMQChannel.sendToQueue(
                Constants.QUEUE_SMS,
                Buffer.from(JSON.stringify(SMSPayload))
            );

            // Browser device id is used to override device id in browser to support multiple browser
            res.send(
                successResponse({
                    isNewUser,
                    user: sanitize(requestUser).user(),
                    device: sanitize(requestDevice).device(),
                    browserDeviceId:
                        requestDevice.type === constants.DEVICE_TYPE_BROWSER
                            ? requestDevice.deviceId
                            : undefined,
                })
            );
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`));
        }
    });

    router.post("/verify", validate(verifySchema), async (req: Request, res: Response) => {
        try {
            const verificationCode = req.body.code as string;
            const deviceId = req.body.deviceId as string;

            let requestDevice = await prisma.device.findFirst({
                where: {
                    deviceId: deviceId,
                },
            });

            if (!requestDevice) {
                return res.status(404).send(errorResponse("Device not found"));
            }

            const requestUser = await prisma.user.findMany({
                where: { verificationCode },
                orderBy: {
                    createdAt: "desc",
                },
            });

            if (!requestUser || requestUser.length === 0) {
                return res.status(403).send(errorResponse("Verification code is invalid"));
            }

            const findUser: User = requestUser.find((user) => user.id === requestDevice.userId);

            if (!findUser) {
                return res.status(403).send(errorResponse("Verification code is invalid"));
            }

            await prisma.user.update({
                where: {
                    id: findUser.id,
                },
                data: {
                    verificationCode: "",
                    verified: true,
                },
            });

            const newToken = Utils.createToken();
            const expireDate = Utils.getTokenExpireDate();

            requestDevice = await prisma.device.update({
                where: {
                    id: requestDevice.id,
                },
                data: {
                    token: newToken,
                    tokenExpiredAt: expireDate,
                },
            });

            const chatGTPUser = await prisma.user.findFirst({
                where: {
                    displayName: "CHAT GTP",
                    verified: true,
                    isBot: true,
                },
            });

            await prisma.contact.create({
                data: {
                    userId: findUser.id,
                    contactId: chatGTPUser.id,
                },
            });

            res.send(
                successResponse({
                    user: sanitize(findUser).user(),
                    device: sanitize(requestDevice).device(),
                })
            );
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`));
        }
    });

    return router;
};
