import { Router, Request, Response } from "express";
import adminAuth from "../lib/adminAuth";
import Utils from "../../../components/utils";
import * as consts from "../../../components/consts";
import l, { error as le } from "../../../components/logger";
import { InitRouterParams } from "../../types/serviceInterface";
import { successResponse, errorResponse } from "../../../components/response";
import { UserRequest } from "../../messenger/lib/types";
import { User } from "@prisma/client";
import sanitize from "../../../components/sanitize";
import prisma from "../../../components/prisma";

export default (params: InitRouterParams) => {
    const router = Router();

    router.get("/search", adminAuth, async (req: Request, res: Response) => {
        const searchTerm: string = req.query.searchTerm ? (req.query.searchTerm as string) : "";
        const userReq: UserRequest = req as UserRequest;
        try {
            let allUsers: User[] = [];
            if (onlyNumbers(searchTerm)) {
                const phoneUsers: User[] = await prisma.user.findMany({
                    where: {
                        telephoneNumber: {
                            contains: searchTerm,
                        },
                    },
                });
                allUsers.push(...phoneUsers);
            }

            const emailUsers: User[] = await prisma.user.findMany({
                where: {
                    emailAddress: {
                        contains: searchTerm,
                    },
                },
            });
            const nameUsers: User[] = await prisma.user.findMany({
                where: {
                    displayName: {
                        contains: searchTerm,
                    },
                },
            });
            allUsers.push(...emailUsers);
            allUsers.push(...nameUsers);

            allUsers = allUsers.filter(
                (value, index, self) => index === self.findIndex((t) => t.id === value.id)
            );

            const count = allUsers.length;

            return res.send(
                successResponse(
                    {
                        list: allUsers,
                        count: count,
                        limit: consts.PAGING_LIMIT,
                    },
                    userReq.lang
                )
            );
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.get("/verified", adminAuth, async (req: Request, res: Response) => {
        const page: number = parseInt(req.query.page ? (req.query.page as string) : "") || 0;
        const userReq: UserRequest = req as UserRequest;
        try {
            const users = await prisma.user.findMany({
                where: {
                    verified: true,
                },
                orderBy: [
                    {
                        createdAt: "asc",
                    },
                ],
                skip: consts.PAGING_LIMIT * page,
                take: consts.PAGING_LIMIT,
            });

            const count = users.length;
            res.send(
                successResponse(
                    {
                        list: users,
                        count: count,
                        limit: consts.PAGING_LIMIT,
                    },
                    userReq.lang
                )
            );
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });
    router.post("/", adminAuth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        try {
            const displayName: string = req.body.displayName;
            const emailAddress: string = req.body.emailAddress;
            const telephoneNumber: string = req.body.telephoneNumber;
            const avatarFileId: number = parseInt(req.body.avatarFileId || "0");
            const verified: boolean = req.body.verified;

            if (Utils.isEmpty(displayName))
                return res
                    .status(400)
                    .send(errorResponse(`Display name is required`, userReq.lang));

            const user = await prisma.user.findMany({
                where: {
                    telephoneNumber: telephoneNumber,
                },
            });
            const email = await prisma.user.findUnique({
                where: {
                    emailAddress: emailAddress,
                },
            });

            if (user.length > 0 && email != null) {
                return res
                    .status(400)
                    .send(errorResponse(`Phone number and email are already in use`, userReq.lang));
            } else if (user.length > 0) {
                return res
                    .status(400)
                    .send(errorResponse(`Phone number is already in use`, userReq.lang));
            } else if (email != null) {
                return res.status(400).send(errorResponse(`Email is already in use`, userReq.lang));
            }
            const newUser = await prisma.user.create({
                data: {
                    displayName: displayName,
                    emailAddress: emailAddress,
                    telephoneNumber: telephoneNumber,
                    avatarFileId: avatarFileId,
                    verified: verified,
                },
            });

            return res.send(successResponse({ user: newUser }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    /**
     * TODO: impliment order
     */
    router.get("/", adminAuth, async (req: Request, res: Response) => {
        const page: number = parseInt(req.query.page ? (req.query.page as string) : "") || 0;
        const userReq: UserRequest = req as UserRequest;
        try {
            const users = await prisma.user.findMany({
                where: {},
                orderBy: [
                    {
                        createdAt: "asc",
                    },
                ],
                skip: consts.PAGING_LIMIT * page,
                take: consts.PAGING_LIMIT,
            });

            const count = await prisma.user.count();
            res.send(
                successResponse(
                    {
                        list: users,
                        count: count,
                        limit: consts.PAGING_LIMIT,
                    },
                    userReq.lang
                )
            );
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.get("/:userId", adminAuth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        try {
            const userId: number = parseInt(req.params.userId);

            // check existance
            const user = await prisma.user.findFirst({
                where: {
                    id: userId,
                },
            });

            if (!user) return res.status(404).send(errorResponse(`Wrong user id`, userReq.lang));

            return res.send(successResponse({ user: sanitize(user).user() }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.put("/:userId", adminAuth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        try {
            const userId: number = parseInt(req.params.userId);

            const displayName: string = req.body.displayName;
            const emailAddress: string = req.body.emailAddress;
            const telephoneNumber: string = req.body.telephoneNumber;
            const avatarFileId: number = parseInt(req.body.avatarFileId || "0");
            const verified: boolean = req.body.verified;
            const verificationCode: string = req.body.verificationCode;

            // check existance
            const user: User = await prisma.user.findFirst({
                where: {
                    id: userId,
                },
            });

            if (!user) return res.status(404).send(errorResponse(`Wrong user id`, userReq.lang));

            const phoneNumber: User = await prisma.user.findFirst({
                where: {
                    telephoneNumber: telephoneNumber,
                },
            });
            const email: User = await prisma.user.findUnique({
                where: {
                    emailAddress: emailAddress,
                },
            });

            if (
                phoneNumber != null &&
                phoneNumber.id != user.id &&
                email != null &&
                email.id != user.id
            ) {
                return res
                    .status(400)
                    .send(errorResponse(`Phone number and email are already in use`, userReq.lang));
            } else if (phoneNumber != null && phoneNumber.id != user.id) {
                return res
                    .status(400)
                    .send(errorResponse(`Phone number is already in use`, userReq.lang));
            } else if (email != null && email.id != user.id) {
                return res.status(400).send(errorResponse(`Email is already in use`, userReq.lang));
            }

            const updateValues: any = {};
            if (displayName) updateValues.displayName = displayName;
            if (emailAddress) updateValues.emailAddress = emailAddress;
            if (telephoneNumber) updateValues.telephoneNumber = telephoneNumber;
            if (avatarFileId) updateValues.avatarFileId = avatarFileId;
            if (verified != null) updateValues.verified = verified;
            if (verificationCode) updateValues.verificationCode = verificationCode;

            if (Object.keys(updateValues).length == 0)
                return res.status(400).send(errorResponse(`Nothing to update`, userReq.lang));

            const updateUser = await prisma.user.update({
                where: { id: userId },
                data: updateValues,
            });
            return res.send(successResponse({ user: updateUser }, userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    router.delete("/:userId", adminAuth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        try {
            const userId: number = parseInt(req.params.userId);
            // check existance
            const user = await prisma.user.findFirst({
                where: {
                    id: userId,
                },
            });

            if (!user) return res.status(404).send(errorResponse(`Wrong user id`, userReq.lang));

            const fromDevice = await prisma.device.findMany({ where: { userId: userId } });
            const fromDeviceIds = fromDevice.map((ru) => ru.id);
            const selectedMessages = await prisma.message.findMany({
                where: {
                    fromDeviceId: { in: fromDeviceIds },
                },
            });
            const selectedMessagesIds = selectedMessages.map((ru) => ru.id);
            const deleteMessageDevice = await prisma.deviceMessage.deleteMany({
                where: { messageId: { in: selectedMessagesIds } },
            });
            const deleteMessageRecord = await prisma.messageRecord.deleteMany({
                where: { messageId: { in: selectedMessagesIds } },
            });

            const deleteMessages = await prisma.message.deleteMany({
                where: { fromDeviceId: { in: fromDeviceIds } },
            });

            const deleteDevice = await prisma.device.deleteMany({
                where: { userId: userId },
            });

            const deleteContactByContactId = await prisma.contact.deleteMany({
                where: { contactId: userId },
            });

            const deleteContactByUserId = await prisma.contact.deleteMany({
                where: { userId: userId },
            });

            const deleteByMessageRecord = await prisma.messageRecord.deleteMany({
                where: { userId: userId },
            });

            const deleteFromRoom = await prisma.roomUser.deleteMany({
                where: { userId: userId },
            });

            const deleteResult = await prisma.user.delete({
                where: { id: userId },
            });
            return res.send(successResponse("OK", userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    function onlyNumbers(str: string) {
        return /^[0-9]+$/.test(str);
    }
    return router;
};
