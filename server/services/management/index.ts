import { Router, Request, Response } from "express";

import authRouter from "./route/auth";
import userRouter from "./route/user";

const userManagementRouter = Router();

userManagementRouter.use("/auth", authRouter);
userManagementRouter.use("/user", userRouter);

export default userManagementRouter;
