import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import adminAuth from "../lib/adminAuth";
import Utils from "../../../components/utils";
import * as consts from "../../../components/consts";

import l, { error as le } from "../../../components/logger";

import { InitRouterParams } from "../../types/serviceInterface";
import { successResponse, errorResponse } from "../../../components/response";
import { UserRequest } from "../../messenger/lib/types";
import { User } from "@prisma/client";

interface UserResponse {}
export default (params: InitRouterParams) => {
    const router = Router();

    router.post("/", adminAuth, async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        try {
            const displayName: string = req.body.displayName;
            const emailAddress: string = req.body.emailAddress;
            const countryCode: string = req.body.countryCode;
            const telephoneNumber: string = req.body.telephoneNumber;
            const avatarUrl: string = req.body.avatarUrl;
            const verified: boolean = req.body.verified;

            if (Utils.isEmpty(displayName))
                return res
                    .status(400)
                    .send(errorResponse(`Display name is required`, userReq.lang));

            const user = await prisma.user.findMany({
                where: {
                    countryCode: countryCode,
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
                    countryCode: countryCode,
                    telephoneNumber: telephoneNumber,
                    avatarUrl: avatarUrl,
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

            return res.send(successResponse({ user }, userReq.lang));
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
            const countryCode: string = req.body.countryCode;
            const telephoneNumber: string = req.body.telephoneNumber;
            const avatarUrl: string = req.body.avatarUrl;
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
                    countryCode: countryCode,
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
            if (countryCode) updateValues.countryCode = countryCode;
            if (telephoneNumber) updateValues.telephoneNumber = telephoneNumber;
            if (avatarUrl) updateValues.avatarUrl = avatarUrl;
            if (verified) updateValues.verified = verified;
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

            const deleteResult = await prisma.user.delete({
                where: { id: userId },
            });
            return res.send(successResponse("OK", userReq.lang));
        } catch (e: any) {
            le(e);
            res.status(500).json(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    return router;
};
