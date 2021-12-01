import { Router } from "express";

import authRouter from "./route/auth";
import userRouter from "./route/user";
import deviceRouter from "./route/device";
import roomRouter from "./route/room";

import Service from "../types/serviceInterface";
export default class Management implements Service {
    async start({}) {}

    getRoutes() {
        const userManagementRouter = Router();
        userManagementRouter.use("/auth", authRouter({}));
        userManagementRouter.use("/user", userRouter({}));
        userManagementRouter.use("/device", deviceRouter({}));
        userManagementRouter.use("/room", roomRouter({}));
        return userManagementRouter;
    }

    async test() {}
}
