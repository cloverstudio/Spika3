import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import { UserRequest } from "../lib/types";
import Utils from "../../../components/utils";
import * as consts from "../../../components/consts";
import l, { error as le } from "../../../components/logger";
import auth from "../lib/auth";
import { InitRouterParams } from "../../types/serviceInterface";

export default (params: InitRouterParams) => {
  const router = Router();

  router.get("/", async (req: Request, res: Response) => {
    try {
      res.send("test");
    } catch (e: any) {
      le(e);
      res.status(500).send(`Server error ${e}`);
    }
  });

  router.get("/auth", auth, async (req: Request, res: Response) => {
    const userReq: UserRequest = req as UserRequest;

    try {
      res.send({
        device: userReq.device,
        user: userReq.user,
      });
    } catch (e: any) {
      le(e);
      res.status(500).send(`Server error ${e}`);
    }
  });

  return router;
};
