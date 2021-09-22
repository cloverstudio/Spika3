import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import adminAuth from "../lib/adminAuth";
import Utils from "../../../components/utils";
import * as consts from "../../../components/consts";

import l, { error as le } from "../../../components/logger";

const router = Router();

router.post("/", adminAuth, async (req: Request, res: Response) => {
  try {
    const displayName: string = req.body.displayName;
    const loginName: string = req.body.loginName;
    const password: string = req.body.password;
    const email: string = req.body.email;
    const avatarUrl: string = req.body.avatarUrl;

    if (Utils.isEmpty(loginName))
      return res.status(400).send("loginName is required");

    if (Utils.isEmpty(password))
      return res.status(400).send("password is required");

    if (!Utils.checkLoginName(loginName))
      return res.status(400).send("invalid loginName");

    if (!Utils.checkPassword(password))
      return res.status(400).send("invalid password");

    const newUser = await prisma.userAccount.create({
      data: {
        displayName: displayName,
        loginName: loginName,
        email: email,
        password: password,
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
    const users = await prisma.userAccount.findMany({
      where: {},
      orderBy: [
        {
          createdAt: "asc",
        },
      ],
      skip: consts.PAGING_LIMIT * page,
      take: consts.PAGING_LIMIT,
    });

    const count = await prisma.userAccount.count();

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
    const user = await prisma.userAccount.findFirst({
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
    const loginName: string = req.body.loginName;
    const password: string = req.body.password;
    const email: string = req.body.email;
    const avatarUrl: string = req.body.avatarUrl;

    // check existance
    const user = await prisma.userAccount.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) return res.status(404).send("wrong user id");

    if (loginName && loginName.length > 0 && !Utils.checkLoginName(loginName))
      return res.status(400).send("invalid loginName");

    if (password && password.length > 0 && !Utils.checkPassword(password))
      return res.status(400).send("invalid password");

    const updateUser = await prisma.userAccount.update({
      where: { id: userId },
      data: {
        displayName: displayName,
        loginName: loginName,
        email: email,
        password: password,
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
    const user = await prisma.userAccount.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) return res.status(404).send("wrong user id");

    const deleteResult = await prisma.userAccount.delete({
      where: { id: userId },
    });

    return res.send("OK");
  } catch (e: any) {
    le(e);
    res.status(500).send(`Server error ${e}`);
  }
});

export default router;
