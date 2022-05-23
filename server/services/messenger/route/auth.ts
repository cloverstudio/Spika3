import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

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
import device from "./device";

const prisma = new PrismaClient();

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

            // Handle irregular cases here

            // The cases to handle
            // 1. When user changes telephone number before success signup.
            //     -> Delete the previous device and user
            // 2. When user changes telephone number after signed up successfully
            //     -> Return error.
            // 3. When new device id comes from same telephone number
            //     -> Is's ok. User can have multiple devices

            // 1. When user changes telephone number before success signup.
            let registeredDevice = await prisma.device.findFirst({
                where: { deviceId },
                include: {
                    user: true,
                },
            });

            if (
                registeredDevice &&
                registeredDevice.user &&
                registeredDevice.user.telephoneNumber !== telephoneNumber &&
                registeredDevice.user.verified === false
            ) {
                // delete both device and user related to the device id
                await prisma.device.delete({
                    where: { id: registeredDevice.id },
                });

                await prisma.user.delete({
                    where: { id: registeredDevice.userId },
                });
            }

            // 2. When user changes telephone number after signed up successfully
            if (
                registeredDevice &&
                registeredDevice.user &&
                registeredDevice.user.telephoneNumber !== telephoneNumber &&
                registeredDevice.user.verified === true
            ) {
                // return error
                return res
                    .status(400)
                    .send(errorResponse(`The device is alread registered to database.`));
            }

            // The main logic starts here.
            const verificationCode =
                process.env.IS_TEST === "1"
                    ? Constants.BACKDOOR_VERIFICATION_CODE
                    : Utils.randomNumber(6);

            let requestUser = await prisma.user.findFirst({
                where: { telephoneNumber },
            });

            if (!requestUser) {
                const newUser = await prisma.user.create({
                    data: {
                        telephoneNumber,
                        telephoneNumberHashed,
                        verificationCode,
                    },
                });

                requestUser = newUser;
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
                l("create new device");

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
                requestDevice = await prisma.device.update({
                    where: {
                        id: requestDevice.id,
                    },
                    data: {
                        tokenExpiredAt: new Date(),
                    },
                });
            }

            l(requestDevice);

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

            const requestUser = await prisma.user.findFirst({
                where: { verificationCode },
                orderBy: {
                    createdAt: "desc",
                },
            });

            if (!requestUser) {
                return res.status(403).send(errorResponse("Verification code is invalid"));
            }

            let requestDevice = await prisma.device.findFirst({
                where: {
                    deviceId: deviceId,
                    userId: requestUser.id,
                },
            });

            if (!requestDevice) {
                return res.status(403).send(errorResponse("Invalid device id"));
            }

            await prisma.user.update({
                where: {
                    id: requestUser.id,
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

            res.send(
                successResponse({
                    user: sanitize(requestUser).user(),
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
