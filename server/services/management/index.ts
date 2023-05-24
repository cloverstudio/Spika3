import { Router } from "express";
import { createClient } from "redis";

import authRouter from "./route/auth";
import userRouter from "./route/user";
import countRouter from "./route/count";
import groupsRouter from "./route/group";

import Service, { ServiceStartParams } from "../types/serviceInterface";

export default class Management implements Service {
    redisClient: ReturnType<typeof createClient>;

    start({ redisClient }: ServiceStartParams) {
        this.redisClient = redisClient;
    }

    getRoutes() {
        const userManagementRouter = Router();
        userManagementRouter.use("/auth", authRouter({ redisClient: this.redisClient }));
        userManagementRouter.use("/counts", countRouter({ redisClient: this.redisClient }));
        userManagementRouter.use("/users", userRouter({ redisClient: this.redisClient }));
        userManagementRouter.use("/groups", groupsRouter({ redisClient: this.redisClient }));
        return userManagementRouter;
    }

    test() {}
}
