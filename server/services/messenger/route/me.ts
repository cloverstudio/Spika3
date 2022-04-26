import { Router, Request, Response } from "express";
import { Device, PrismaClient, User } from "@prisma/client";

import { error as le } from "../../../components/logger";
import validate from "../../../components/validateMiddleware";
import * as yup from "yup";
import { successResponse, errorResponse } from "../../../components/response";
import auth from "../lib/auth";
import { UserRequest } from "../lib/types";
import sanitize from "../../../components/sanitize";
import Utils from "../../../components/utils";
import { InitRouterParams } from "../../types/serviceInterface";
import * as Constants from "../../../components/consts";

const prisma = new PrismaClient();

const updateSchema = yup.object().shape({
    body: yup.object().shape({
        telephoneNumber: yup.string().strict(),
        telephoneNumberHashed: yup.string().strict(),
        emailAddress: yup.string().strict(),
        displayName: yup.string().strict(),
        avatarUrl: yup.string().strict(),
    }),
});

export default ({ rabbitMQChannel }: InitRouterParams): Router => {
    const router = Router();

    router.get("/", auth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;

        try {
            res.send(successResponse({ user: sanitize(userReq.user).user() }));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.put("/", auth, validate(updateSchema), async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const id = userReq.user.id;

        try {
            const { telephoneNumber, emailAddress, displayName, avatarUrl } = req.body;

            const userWithSameEmailAddress =
                emailAddress &&
                (await prisma.user.findFirst({
                    where: { emailAddress, id: { not: id } },
                }));
            if (userWithSameEmailAddress) {
                return res
                    .status(400)
                    .send(errorResponse("User with that email exists", userReq.lang));
            }

            const userWithSameTelephoneNumber =
                telephoneNumber &&
                (await prisma.user.findFirst({
                    where: { telephoneNumber, id: { not: id } },
                }));
            if (userWithSameTelephoneNumber) {
                return res
                    .status(400)
                    .send(errorResponse("User with that telephoneNumber exists", userReq.lang));
            }

            const user = await prisma.user.update({
                where: { id },
                data: {
                    telephoneNumber,
                    emailAddress,
                    displayName,
                    avatarUrl,
                    ...(telephoneNumber && {
                        telephoneNumberHashed: Utils.sha256(telephoneNumber),
                    }),
                },
            });

            res.send(successResponse({ user: sanitize(user).user() }));

            const contacts = +process.env["TEAM_MODE"]
                ? await prisma.user.findMany({ include: { device: true } })
                : await getUserContacts(userReq.user.id);

            console.log({ contacts });

            for (const contact of contacts) {
                for (const device of contact.device) {
                    rabbitMQChannel.sendToQueue(
                        Constants.QUEUE_SSE,
                        Buffer.from(
                            JSON.stringify({
                                channelId: device.id,
                                data: {
                                    type: Constants.PUSH_TYPE_USER_UPDATE,
                                    user: sanitize(user).user(),
                                },
                            })
                        )
                    );
                }
            }
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    return router;
};

async function getUserContacts(userId: number): Promise<(User & { device: Device[] })[]> {
    const contacts = await prisma.contact.findMany({
        where: { userId },
        include: { contact: { include: { device: true } } },
    });

    return contacts.map((c) => c.contact);
}
