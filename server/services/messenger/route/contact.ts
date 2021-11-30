import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

import { UserRequest, errorParams } from "../lib/types";
import { error as le } from "../../../components/logger";
import * as Constants from "../../../components/consts";

import auth from "../lib/auth";
import { InitRouterParams } from "../../types/serviceInterface";
import * as yup from "yup";
import validate from "../../../components/validateMiddleware";
import { successResponse, errorResponse } from "../../../components/response";

const prisma = new PrismaClient();

const postContactsSchema = yup.object().shape({
    body: yup.object().shape({
        contacts: yup.lazy((value) =>
            typeof value === "string"
                ? yup.string().transform((value) =>
                      value
                          .split(",")
                          .map((v: string) => v.trim())
                          .filter((v: string) => v)
                  )
                : yup
                      .array(yup.string())
                      .strict()
                      .min(1)
                      .max(Constants.CONTACT_SYNC_LIMIT)
                      .required()
                      .typeError(
                          ({ path, originalValue }: errorParams): string =>
                              `${path} must be array or string, currently: ${originalValue}`
                      )
        ),
    }),
});

const getContactsSchema = yup.object().shape({
    query: yup.object().shape({
        page: yup.number().default(1),
    }),
});

export default ({ rabbitMQChannel }: InitRouterParams): Router => {
    const router = Router();

    router.get("/", auth, validate(getContactsSchema), async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        try {
            const page: number = parseInt(req.query.page ? (req.query.page as string) : "") || 1;

            const contacts = await prisma.contact.findMany({
                where: {
                    user: userReq.user,
                },
                include: {
                    contact: true,
                },
                orderBy: [
                    {
                        createdAt: "asc",
                    },
                ],
                skip: Constants.PAGING_LIMIT * (page - 1),
                take: Constants.PAGING_LIMIT,
            });

            const count = await prisma.contact.count({
                where: {
                    user: userReq.user,
                },
            });

            res.send(
                successResponse(
                    {
                        list: contacts.map((c) => c.contact),
                        count: count,
                        limit: Constants.PAGING_LIMIT,
                    },
                    userReq.lang
                )
            );
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.post("/", auth, validate(postContactsSchema), async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        try {
            const hashList: Array<string> = req.body.contacts;

            const verifiedUsers = await prisma.user.findMany({
                where: {
                    telephoneNumberHashed: { in: hashList },
                    verified: true,
                },
            });

            verifiedUsers.forEach((contact) => {
                const payload = { userId: userReq.user.id, contactId: contact.id };

                rabbitMQChannel.sendToQueue(
                    Constants.QUEUE_CREATE_CONTACT,
                    Buffer.from(JSON.stringify(payload))
                );
            });

            res.send(
                successResponse(
                    {
                        list: verifiedUsers,
                        count: verifiedUsers.length,
                        limit: Constants.CONTACT_SYNC_LIMIT,
                    },
                    userReq.lang
                )
            );
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    return router;
};
