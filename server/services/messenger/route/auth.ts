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
import prisma from "../../../components/prisma";
import { handleNewUser } from "../../../components/agent";
import { UserRequest } from "../lib/types";
import auth from "../lib/auth";

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
                registeredDevice.token &&
                registeredDevice.user.telephoneNumber !== telephoneNumber &&
                deviceType !== Constants.DEVICE_TYPE_BROWSER
            ) {
                return res
                    .status(403)
                    .send(errorResponse(`There is already phone number tied to this device`));
            }

            const isTester = Constants.TESTER_PHONE_NUMBERS.includes(telephoneNumber);

            const verificationCode =
                process.env.IS_TEST === "1" || isTester
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
                        modifiedAt: new Date(),
                    },
                });
            }

            l(`Verification code ${verificationCode}, device id ${deviceId}`);

            // is new device ?
            let requestDevice = await prisma.device.findFirst({
                where: { deviceId },
            });

            // check the user already has browser device
            if (deviceType === Constants.DEVICE_TYPE_BROWSER) {
                const browserDevice = await prisma.device.findFirst({
                    where: {
                        userId: requestUser.id,
                        type: Constants.DEVICE_TYPE_BROWSER,
                    },
                });

                if (browserDevice) {
                    requestDevice = browserDevice;
                }
            } else if (+process.env.ALLOW_MULTIPLE_MOBILE_APP_DEVICES) {
                // expire other tokens if not browser
                await prisma.device.updateMany({
                    where: {
                        userId: requestUser.id,
                        type: {
                            not: Constants.DEVICE_TYPE_BROWSER,
                        },
                    },
                    data: {
                        tokenExpiredAt: new Date(),
                        pushToken: null,
                        modifiedAt: new Date(),
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
                requestDevice = await prisma.device.update({
                    where: {
                        id: requestDevice.id,
                    },
                    data: {
                        userId: requestUser.id,
                        ...(deviceType !== Constants.DEVICE_TYPE_BROWSER && {
                            tokenExpiredAt: new Date(),
                            pushToken: null,
                            modifiedAt: new Date(),
                        }),
                    },
                });
            }

            if (process.env.IS_TEST !== "1" && !isTester) {
                const SMSPayload: SendSMSPayload = {
                    telephoneNumber,
                    content: verificationCodeSMS({ verificationCode, osName }),
                };

                rabbitMQChannel.sendToQueue(
                    Constants.QUEUE_SMS,
                    Buffer.from(JSON.stringify(SMSPayload))
                );
            }

            // Browser device id is used to override device id in browser to support multiple browser
            res.send(
                successResponse({
                    isNewUser,
                    user: sanitize(requestUser).user(),
                    device: sanitize(requestDevice).device(),
                    browserDeviceId:
                        requestDevice.type === Constants.DEVICE_TYPE_BROWSER
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
                    deviceId,
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
                    modifiedAt: new Date(),
                    pushToken: null,
                },
            });

            handleNewUser(findUser.id);

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

    router.post("/logout", auth, async (req: Request, res: Response) => {
        try {
            const userReq: UserRequest = req as UserRequest;
            const id = userReq.device.id;

            const requestDevice = await prisma.device.findUnique({
                where: {
                    id,
                },
            });

            if (!requestDevice) {
                return res.status(404).send(errorResponse("Device not found"));
            }

            const device = await prisma.device.update({
                where: {
                    id,
                },
                data: {
                    tokenExpiredAt: new Date(),
                    modifiedAt: new Date(),
                    pushToken: null,
                    token: null,
                },
            });

            res.send(
                successResponse({
                    device: sanitize(device).device(),
                })
            );
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`));
        }
    });

    return router;
};
