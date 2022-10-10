import amqp from "amqplib";

import * as Constants from "../../components/consts";
import Service, { ServiceStartParams } from "../types/serviceInterface";
import { SendMessageRecordSSEPayload } from "../types/queuePayloadTypes";

import sendMessageRecordWorker from "./worker/sendMessageRecord";

export default class MessageRecordsSSEService implements Service {
    async start({ rabbitMQChannel }: ServiceStartParams): Promise<void> {
        await rabbitMQChannel.assertQueue(Constants.QUEUE_MESSAGE_RECORDS_SSE, {
            durable: false,
        });

        rabbitMQChannel.consume(
            Constants.QUEUE_MESSAGE_RECORDS_SSE,
            async (msg: amqp.ConsumeMessage) => {
                rabbitMQChannel.ack(msg);
                const payload: SendMessageRecordSSEPayload = JSON.parse(msg.content.toString());
                await sendMessageRecordWorker.run(payload, rabbitMQChannel);
            }
        );
    }

    async test() {}
}
