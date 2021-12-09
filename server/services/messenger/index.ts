import { Router } from "express";
import amqp from "amqplib";

import testRouter from "./route/test";
import signupRouter from "./route/auth";
import contactRouter from "./route/contact";
import roomRouter from "./route/room";
import messageRouter from "./route/message";
import meRouter from "./route/me";

import * as Constants from "../../components/consts";
import Service, { ServiceStartParams } from "../types/serviceInterface";
import { CreateContactPayload } from "../types/queuePayloadTypes";

import saveContactWorker from "./workers/saveContact";

export default class Messenger implements Service {
    rabbitMQChannel: amqp.Channel | null | undefined = null;

    async start({ rabbitMQChannel }: ServiceStartParams): Promise<void> {
        this.rabbitMQChannel = rabbitMQChannel;

        await this.rabbitMQChannel.assertQueue(Constants.QUEUE_CREATE_CONTACT, {
            durable: false,
        });

        this.rabbitMQChannel.consume(
            Constants.QUEUE_CREATE_CONTACT,
            async (msg: amqp.ConsumeMessage) => {
                const payload: CreateContactPayload = JSON.parse(msg.content.toString());
                await saveContactWorker.run(payload);
                rabbitMQChannel.ack(msg);
            }
        );
    }

    getRoutes(): Router {
        const messengerRouter = Router();
        messengerRouter.use("/test", testRouter({}));
        messengerRouter.use("/auth", signupRouter({ rabbitMQChannel: this.rabbitMQChannel }));
        messengerRouter.use("/contacts", contactRouter({ rabbitMQChannel: this.rabbitMQChannel }));
        messengerRouter.use("/rooms", roomRouter());
        messengerRouter.use("/messages", messageRouter({ rabbitMQChannel: this.rabbitMQChannel }));
        messengerRouter.use("/me", meRouter());
        return messengerRouter;
    }

    async test() {}
}
