import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import adminAuth from "../lib/adminAuth";
import Utils from "../../../components/utils";
import * as consts from "../../../components/consts";

import l, { error as le } from "../../../components/logger";

import { InitRouterParams } from "../../types/serviceInterface";

interface UserResponse {}
export default (params: InitRouterParams) => {
    const router = Router();

    router.post("/", adminAuth, async (req: Request, res: Response) => {
        try {
            const displayName: string = req.body.displayName;
            const emailAddress: string = req.body.emailAddress;
            const countryCode: string = req.body.countryCode;
            const telephoneNumber: string = req.body.telephoneNumber;
            const avatarUrl: string = req.body.avatarUrl;
            const verified: boolean = req.body.verified;

            if (Utils.isEmpty(displayName)) return res.status(400).send("displayName is required");
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

            return res.send(newUser);
        } catch (e: any) {
            le(e);
            res.status(500).send(`Server error ${e}`);
        }
    });

    /**
     * TODO: impliment order
     */
    router.get("/", adminAuth, async (req: Request, res: Response) => {
        const page: number = parseInt(req.query.page ? (req.query.page as string) : "") || 0;

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

            res.json({
                list: users,
                count: count,
                limit: consts.PAGING_LIMIT,
            });
        } catch (e: any) {
            le(e);
            res.status(500).send(`Server error ${e}`);
        }
    });

    router.get("/:userId", adminAuth, async (req: Request, res: Response) => {
        try {
            const userId: number = parseInt(req.params.userId);

            // check existance
            const user = await prisma.user.findFirst({
                where: {
                    id: userId,
                },
            });

            if (!user) return res.status(404).send("wrong user id");

            return res.send(user);
        } catch (e: any) {
            le(e);
            res.status(500).send(`Server error ${e}`);
        }
    });

    router.put("/:userId", adminAuth, async (req: Request, res: Response) => {
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
            const user = await prisma.user.findFirst({
                where: {
                    id: userId,
                },
            });

            if (!user) return res.status(404).send("wrong user id");

            const updateValues: any = {};
            if (displayName) updateValues.displayName = displayName;
            if (emailAddress) updateValues.emailAddress = emailAddress;
            if (countryCode) updateValues.countryCode = countryCode;
            if (telephoneNumber) updateValues.telephoneNumber = telephoneNumber;
            if (avatarUrl) updateValues.avatarUrl = avatarUrl;
            if (verified) updateValues.verified = verified;
            if (verificationCode) updateValues.verificationCode = verificationCode;

            if (Object.keys(updateValues).length == 0)
                return res.status(400).send("No params to update");

            const updateUser = await prisma.user.update({
                where: { id: userId },
                data: updateValues,
            });
            return res.send(updateUser);
        } catch (e: any) {
            le(e);
            res.status(500).send(`Server error ${e}`);
        }
    });

    router.delete("/:userId", adminAuth, async (req: Request, res: Response) => {
        try {
            const userId: number = parseInt(req.params.userId);

            // check existance
            const user = await prisma.user.findFirst({
                where: {
                    id: userId,
                },
            });

            if (!user) return res.status(404).send("wrong user id");

            const deleteResult = await prisma.user.delete({
                where: { id: userId },
            });

            return res.send("OK");
        } catch (e: any) {
            le(e);
            res.status(500).send(`Server error ${e}`);
        }
    });

    return router;
};
