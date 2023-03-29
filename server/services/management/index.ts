import { Router } from "express";

import authRouter from "./route/auth";
import userRouter from "./route/user";
import countRouter from "./route/count";
import groupsRouter from "./route/group";
import messageRouter from "./route/message";

import Service from "../types/serviceInterface";
export default class Management implements Service {
    start({}) {}

    getRoutes() {
        const userManagementRouter = Router();
        userManagementRouter.use("/auth", authRouter());
        userManagementRouter.use("/counts", countRouter());
        userManagementRouter.use("/users", userRouter());
        userManagementRouter.use("/groups", groupsRouter());
        userManagementRouter.use("/message", messageRouter({}));
        return userManagementRouter;
    }

    test() {}
}
