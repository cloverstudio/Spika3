import { Router, Request, Response } from "express";
import amqp from 'amqplib';

import testRouter from "./route/test";
import signupRouter from "./route/auth";

import Service, { ServiceStartParams } from "../serviceInterface"
export default class Messenger implements Service {

    rabbitMQConnetion: amqp.Connection | null | undefined = null;

    async start({ rabbitMQConnetion }: ServiceStartParams) {
        this.rabbitMQConnetion = rabbitMQConnetion;
    }

    getRoutes() {
        const messengerRouter = Router();
        messengerRouter.use("/test", testRouter({}));
        messengerRouter.use("/auth", signupRouter({ rabbitMQConnetion: this.rabbitMQConnetion }));
        return messengerRouter;
    }

    async test() {

    }

}