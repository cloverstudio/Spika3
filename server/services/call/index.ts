import { Router } from "express";
import amqp from "amqplib";

import callRouter from "./route/call";

import Service, { ServiceStartParams } from "../types/serviceInterface";

export default class CallService implements Service {
    rabbitMQChannel: amqp.Channel = null;

    async start({ rabbitMQChannel }: ServiceStartParams): Promise<void> {
        this.rabbitMQChannel = rabbitMQChannel;
    }

    getRoutes(): Router {
        const router = Router();
        router.use("", callRouter({ rabbitMQChannel: this.rabbitMQChannel }));

        return router;
    }
}
