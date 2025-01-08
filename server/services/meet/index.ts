import { Router } from "express";
import amqp from "amqplib";

import meetRouter from "./route/meet";

import Service, { ServiceStartParams } from "../types/serviceInterface";

export default class MeetService implements Service {
    rabbitMQChannel: amqp.Channel = null;

    async start({ rabbitMQChannel }: ServiceStartParams): Promise<void> {
        this.rabbitMQChannel = rabbitMQChannel;
    }

    getRoutes(): Router {
        const router = Router();
        router.use("", meetRouter({ rabbitMQChannel: this.rabbitMQChannel }));

        return router;
    }
}
