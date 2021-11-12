import { Router } from "express";
import amqp from "amqplib";

import testRouter from "./route/test";
import fileRouter from "./route/file";

import * as Constants from "../../components/consts";
import Service, { ServiceStartParams } from "../types/serviceInterface";

export default class Upload implements Service {
    rabbitMQChannel: amqp.Channel | null | undefined = null;

    async start({ rabbitMQChannel }: ServiceStartParams): Promise<void> {
        this.rabbitMQChannel = rabbitMQChannel;
    }

    getRoutes(): Router {
        const messengerRouter = Router();
        messengerRouter.use("/test", testRouter());
        messengerRouter.use("/files", fileRouter());
        return messengerRouter;
    }

    async test() {}
}
