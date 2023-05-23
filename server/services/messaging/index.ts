import { Router } from "express";
import amqp from "amqplib";

import testRouter from "./route/test";
import messageRouter from "./route/message";

import Service, { ServiceStartParams } from "../types/serviceInterface";
import { createClient } from "redis";

export default class Messenger implements Service {
    rabbitMQChannel: amqp.Channel | null | undefined = null;
    redisClient: ReturnType<typeof createClient>;

    async start({ rabbitMQChannel, redisClient }: ServiceStartParams): Promise<void> {
        this.rabbitMQChannel = rabbitMQChannel;
        this.redisClient = redisClient;
    }

    getRoutes(): Router {
        const messengerRouter = Router();
        messengerRouter.use("/test", testRouter({}));
        messengerRouter.use(
            "/messages",
            messageRouter({ rabbitMQChannel: this.rabbitMQChannel, redisClient: this.redisClient })
        );

        return messengerRouter;
    }

    async test() {}
}
