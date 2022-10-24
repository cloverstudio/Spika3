import { Router } from "express";
import amqp from "amqplib";

import joinRouter from "./route/join";
import participantsRouter from "./route/participants";
import mediasoupRouter from "./route/mediasoup";

import Service, { ServiceStartParams } from "../types/serviceInterface";

export default class ConfcallService implements Service {
    rabbitMQChannel: amqp.Channel = null;

    async start({ rabbitMQChannel, server }: ServiceStartParams): Promise<void> {
        this.rabbitMQChannel = rabbitMQChannel;
    }

    getRoutes(): Router {
        const router = Router();
        router.use("/", joinRouter({ rabbitMQChannel: this.rabbitMQChannel }));
        router.use("/participants", participantsRouter({ rabbitMQChannel: this.rabbitMQChannel }));
        router.use("/mediasoup", mediasoupRouter({ rabbitMQChannel: this.rabbitMQChannel }));

        return router;
    }

    async test() {}
}
