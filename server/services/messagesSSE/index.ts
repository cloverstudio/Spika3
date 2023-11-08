import amqp from "amqplib";

import * as Constants from "../../components/consts";
import Service, { ServiceStartParams } from "../types/serviceInterface";
import { SendMessageSSEPayload } from "../types/queuePayloadTypes";

import sendMessageWorker from "./worker/sendMessage";
import { createClient } from "redis";

export default class MessagesSSEService implements Service {
    async start({}: ServiceStartParams): Promise<void> {
        const redisClient = createClient({ url: process.env.REDIS_URL });
        const rabbitMQConnection = await amqp.connect(
            process.env["RABBITMQ_URL"] || "amqp://localhost",
        );
        const rabbitMQChannel: amqp.Channel = await rabbitMQConnection.createChannel();

        await rabbitMQChannel.assertQueue(Constants.QUEUE_MESSAGES_SSE, {
            durable: false,
        });

        await redisClient.connect();
        await rabbitMQChannel.prefetch(1);

        rabbitMQChannel.consume(
            Constants.QUEUE_MESSAGES_SSE,
            async (msg: amqp.ConsumeMessage) => {
                const payload: SendMessageSSEPayload = JSON.parse(msg.content.toString());
                await sendMessageWorker.run(payload, rabbitMQChannel, redisClient);
                rabbitMQChannel.ack(msg);
            },
            { noAck: false },
        );
    }

    async test() {}
}
