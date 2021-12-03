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

const prisma = new PrismaClient();

const authSchema = yup.object().shape({
    body: yup.object().shape({
        telephoneNumber: yup.string().required(),
        telephoneNumberHashed: yup.string().required(),
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
            const telephoneNumberHashed = req.body.telephoneNumberHashed as string;
            const deviceId = req.body.deviceId as string;

            let isNewUser = false;
            let verificationCode: string = null;

            let requestUser = await prisma.user.findFirst({
                where: { telephoneNumber },
            });

            if (!requestUser) {
                verificationCode =
                    process.env.IS_TEST === "1"
                        ? Constants.BACKDOOR_VERIFICATION_CODE
                        : Utils.randomNumber(6);

                l(`Verification code ${verificationCode}, device id ${deviceId}`);

                const newUser = await prisma.user.create({
                    data: {
                        telephoneNumber,
                        telephoneNumberHashed,
                        verificationCode,
                    },
                });

                requestUser = newUser;
                isNewUser = true;
            } else if (requestUser.verified === false) {
                // send sms again

                verificationCode =
                    process.env.IS_TEST === "1"
                        ? Constants.BACKDOOR_VERIFICATION_CODE
                        : Utils.randomNumber(6);

                requestUser = await prisma.user.update({
                    where: {
                        id: requestUser.id,
                    },
                    data: {
                        verificationCode,
                        telephoneNumberHashed,
                    },
                });

                isNewUser = true;
            } else {
                // re-login
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

            // is new device ?
            let requestDevice = await prisma.device.findFirst({
                where: { deviceId },
            });

            if (!requestDevice) {
                requestDevice = await prisma.device.create({
                    data: {
                        deviceId,
                        userId: requestUser.id,
                    },
                });
            }

            // generate token if existed user
            // send SMS if new user
            if (!isNewUser) {
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
            }

            // send sms
            const SMSPayload: SendSMSPayload = {
                telephoneNumber,
                content: verificationCodeSMS({ verificationCode }),
            };

            rabbitMQChannel.sendToQueue(
                Constants.QUEUE_SMS,
                Buffer.from(JSON.stringify(SMSPayload))
            );

            res.send(
                successResponse({
                    isNewUser,
                    user: sanitize(requestUser).user(),
                    device: {
                        id: requestDevice.id,
                    },
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
                    device: requestDevice,
                })
            );
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`));
        }
    });

    return router;
};
