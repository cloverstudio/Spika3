import amqp from "amqplib";

import * as Constants from "../../components/consts";
import Service, { ServiceStartParams } from "../types/serviceInterface";
import { SendPushPayload } from "../types/queuePayloadTypes";

import sendPushWorker from "./worker/sendPush";

export default class PushService implements Service {
    async start({ rabbitMQChannel }: ServiceStartParams): Promise<void> {
        await rabbitMQChannel.assertQueue(Constants.QUEUE_PUSH, {
            durable: false,
        });

        rabbitMQChannel.consume(Constants.QUEUE_PUSH, async (msg: amqp.ConsumeMessage) => {
            rabbitMQChannel.ack(msg);
            const payload: SendPushPayload = JSON.parse(msg.content.toString());
            await sendPushWorker.run(payload);
        });
    }

    async test() {}
}
