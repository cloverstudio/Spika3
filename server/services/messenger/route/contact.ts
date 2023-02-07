import { Router, Request, Response } from "express";

import { UserRequest, errorParams } from "../lib/types";
import { error as le } from "../../../components/logger";
import * as Constants from "../../../components/consts";

import auth from "../lib/auth";
import { InitRouterParams } from "../../types/serviceInterface";
import * as yup from "yup";
import validate from "../../../components/validateMiddleware";
import { successResponse, errorResponse } from "../../../components/response";
import sanitize from "../../../components/sanitize";
import prisma from "../../../components/prisma";
import { checkForChatGPTContacts } from "../../../components/chatGPT";

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
        cursor: yup.number().nullable(),
        keyword: yup.string().strict(),
    }),
});

export default ({ rabbitMQChannel }: InitRouterParams): Router => {
    const router = Router();

    router.get("/", auth, validate(getContactsSchema), async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const keyword = req.query.keyword;
        const cursor = parseInt(req.query.cursor ? (req.query.cursor as string) : "") || null;
        const take = cursor ? Constants.CONTACT_PAGING_LIMIT + 1 : Constants.CONTACT_PAGING_LIMIT;

        if (!cursor) {
            await checkForChatGPTContacts(userReq.user.id);
        }

        const condition: any = {
            verified: true,
            id: {
                not: userReq.user.id,
            },
        };

        if (keyword && keyword.length > 0)
            condition.displayName = {
                startsWith: keyword,
            };

        try {
            if (+process.env["TEAM_MODE"]) {
                const users = await prisma.user.findMany({
                    where: condition,
                    orderBy: [
                        {
                            displayName: "asc",
                        },
                    ],
                    ...(cursor && {
                        cursor: {
                            id: cursor,
                        },
                    }),
                    take,
                });

                const count = await prisma.user.count({
                    where: condition,
                });

                const nextCursor =
                    users.length && users.length >= take ? users[users.length - 1].id : null;

                res.send(
                    successResponse(
                        {
                            list: users.map((c) => sanitize(c).user()),
                            count,
                            limit: Constants.CONTACT_PAGING_LIMIT,
                            nextCursor,
                        },
                        userReq.lang
                    )
                );
            } else {
                const contacts = await prisma.contact.findMany({
                    where: {
                        user: userReq.user,
                        contact: condition,
                    },
                    include: {
                        contact: true,
                    },
                    orderBy: [
                        {
                            contact: {
                                displayName: "asc",
                            },
                        },
                    ],
                    ...(cursor && {
                        cursor: {
                            id: cursor,
                        },
                    }),
                    take,
                });

                const count = await prisma.contact.count({
                    where: {
                        user: userReq.user,
                        contact: condition,
                    },
                });

                const nextCursor =
                    contacts.length && contacts.length >= take
                        ? contacts[contacts.length - 1].contactId
                        : null;

                res.send(
                    successResponse(
                        {
                            list: contacts.map((c) => sanitize(c.contact).user()),
                            count,
                            limit: Constants.CONTACT_PAGING_LIMIT,
                            nextCursor,
                        },
                        userReq.lang
                    )
                );
            }
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
                        list: verifiedUsers.map((user) => sanitize(user).user()),
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
