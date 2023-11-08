import amqp from "amqplib";

import * as Constants from "../../components/consts";
import Service, { ServiceStartParams } from "../types/serviceInterface";
import { SendMessageRecordSSEPayload } from "../types/queuePayloadTypes";

import sendMessageRecordWorker from "./worker/sendMessageRecord";

export default class MessageRecordsSSEService implements Service {
    async start({}: ServiceStartParams): Promise<void> {
        const rabbitMQConnection = await amqp.connect(
            process.env["RABBITMQ_URL"] || "amqp://localhost",
        );
        const rabbitMQChannel: amqp.Channel = await rabbitMQConnection.createChannel();

        await rabbitMQChannel.assertQueue(Constants.QUEUE_MESSAGE_RECORDS_SSE, {
            durable: false,
        });

        await rabbitMQChannel.prefetch(2);

        rabbitMQChannel.consume(
            Constants.QUEUE_MESSAGE_RECORDS_SSE,
            async (msg: amqp.ConsumeMessage) => {
                const payload: SendMessageRecordSSEPayload = JSON.parse(msg.content.toString());
                await sendMessageRecordWorker.run(payload, rabbitMQChannel);
                rabbitMQChannel.ack(msg);
            },
            { noAck: false },
        );
    }

    async test() {}
}
