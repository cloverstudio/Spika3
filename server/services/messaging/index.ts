import { Router } from "express";
import amqp from "amqplib";

import testRouter from "./route/test";
import messageRouter from "./route/message";

import Service, { ServiceStartParams } from "../types/serviceInterface";

export default class Messenger implements Service {
    rabbitMQChannel: amqp.Channel | null | undefined = null;

    async start({ rabbitMQChannel }: ServiceStartParams): Promise<void> {
        this.rabbitMQChannel = rabbitMQChannel;
    }

    getRoutes(): Router {
        const messengerRouter = Router();
        messengerRouter.use("/test", testRouter({}));
        messengerRouter.use("/messages", messageRouter({ rabbitMQChannel: this.rabbitMQChannel }));

        return messengerRouter;
    }

    async test() {}
}
