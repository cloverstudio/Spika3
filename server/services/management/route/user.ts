import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import adminAuth from "../lib/adminAuth";
import Utils from "../../../components/utils";
import * as consts from "../../../components/consts";

import l, { error as le } from "../../../components/logger";

import { InitRouterParams } from "../../types/serviceInterface";

export default (params: InitRouterParams) => {

  const router = Router();

  router.post("/", adminAuth, async (req: Request, res: Response) => {
    try {
      const displayName: string = req.body.displayName;
      const emailAddress: string = req.body.emailAddress;
      const telephoneNumber: string = req.body.email;
      const avatarUrl: string = req.body.avatarUrl;

      if (Utils.isEmpty(displayName))
        return res.status(400).send("displayName is required");

      // todo: unique check
      console.log("displayName", displayName);

      const newUser = await prisma.user.create({
        data: {
          displayName: displayName,
          emailAddress: emailAddress,
          telephoneNumber: telephoneNumber,
          avatarUrl: avatarUrl,
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
    const page: number =
      parseInt(req.query.page ? (req.query.page as string) : "") || 0;

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
      const telephoneNumber: string = req.body.email;
      const avatarUrl: string = req.body.avatarUrl;

      // check existance
      const user = await prisma.user.findFirst({
        where: {
          id: userId,
        },
      });

      if (!user) return res.status(404).send("wrong user id");

      const updateUser = await prisma.user.update({
        where: { id: userId },
        data: {
          displayName: displayName,
          emailAddress: emailAddress,
          telephoneNumber: telephoneNumber,
          avatarUrl: avatarUrl,
        },
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

}

