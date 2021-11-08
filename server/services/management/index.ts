import express from "express";

import { Router, Request, Response } from "express";

import authRouter from "./route/auth";
import userRouter from "./route/user";
import deviceRouter from "./route/device";

import Service from "../types/serviceInterface";
export default class Management implements Service {
  async start({}) {}

  getRoutes() {
    const userManagementRouter = Router();
    userManagementRouter.use("/auth", authRouter({}));
    userManagementRouter.use("/user", userRouter({}));
    userManagementRouter.use("/device", deviceRouter({}));
    return userManagementRouter;
  }

  async test() {}
}
