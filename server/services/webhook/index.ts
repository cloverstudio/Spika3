import amqp from "amqplib";

import * as Constants from "../../components/consts";
import Service, { ServiceStartParams } from "../types/serviceInterface";
import { CallWebhookPayload } from "../types/queuePayloadTypes";

import webhookWorker from "./worker/callWebhook";

export default class WebhookService implements Service {
    async start({ rabbitMQChannel }: ServiceStartParams): Promise<void> {
        await rabbitMQChannel.assertQueue(Constants.QUEUE_WEBHOOK, {
            durable: false,
        });

        rabbitMQChannel.consume(Constants.QUEUE_WEBHOOK, async (msg: amqp.ConsumeMessage) => {
            rabbitMQChannel.ack(msg);
            const payload: CallWebhookPayload = JSON.parse(msg.content.toString());
            await webhookWorker.run(payload);
        });
    }

    async test() {}
}
