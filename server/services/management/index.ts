import { Router } from "express";

import authRouter from "./route/auth";
import userRouter from "./route/user";
import deviceRouter from "./route/device";
import roomRouter from "./route/room";
import messageRouter from "./route/message";

import Service from "../types/serviceInterface";
export default class Management implements Service {
    async start({}) {}

    getRoutes() {
        const userManagementRouter = Router();
        userManagementRouter.use("/auth", authRouter({}));
        userManagementRouter.use("/user", userRouter({}));
        userManagementRouter.use("/device", deviceRouter({}));
        userManagementRouter.use("/room", roomRouter({}));
        userManagementRouter.use("/message", messageRouter({}));
        return userManagementRouter;
    }

    async test() {}
}
