import { Router } from "express";
import amqp from "amqplib";
import { createClient } from "redis";

import testRouter from "./route/test";
import fileRouter from "./route/file";

import Service, { ServiceStartParams } from "../types/serviceInterface";

export default class Upload implements Service {
    rabbitMQChannel: amqp.Channel | null | undefined = null;
    redisClient: ReturnType<typeof createClient>;

    async start({ rabbitMQChannel, redisClient }: ServiceStartParams): Promise<void> {
        this.rabbitMQChannel = rabbitMQChannel;
        this.redisClient = redisClient;
    }

    getRoutes(): Router {
        const messengerRouter = Router();
        messengerRouter.use("/test", testRouter());
        messengerRouter.use("/files", fileRouter({ redisClient: this.redisClient }));
        return messengerRouter;
    }

    async test() { }
}
