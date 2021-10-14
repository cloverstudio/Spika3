import { Router, Request, Response } from "express";
import amqp from 'amqplib';

import testRouter from "./route/test";
import signupRouter from "./route/auth";

import * as Constants from "../../components/consts"

import Service, { ServiceStartParams } from "../types/serviceInterface"
export default class Messenger implements Service {

    rabbitMQChannel: amqp.Channel | null | undefined = null;

    async start({ rabbitMQChannel }: ServiceStartParams) {
        this.rabbitMQChannel = rabbitMQChannel;

        // check queue
        this.rabbitMQChannel.assertQueue(Constants.QUEUE_SMS, {
            durable: false
        });
    }

    getRoutes() {
        const messengerRouter = Router();
        messengerRouter.use("/test", testRouter({}));
        messengerRouter.use("/auth", signupRouter({ rabbitMQChannel: this.rabbitMQChannel }));
        return messengerRouter;
    }

    async test() {

    }

}