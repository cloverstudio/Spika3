import amqp from "amqplib";

import * as Constants from "../../components/consts";
import Service, { ServiceStartParams } from "../types/serviceInterface";
import { SendSMSPayload } from "../types/queuePayloadTypes";

import sendSMSWorker from "./worker/sendSMS";

export default class SMSService implements Service {
    async start({ rabbitMQChannel }: ServiceStartParams): Promise<void> {
        await rabbitMQChannel.assertQueue(Constants.QUEUE_SMS, {
            durable: false,
        });

        rabbitMQChannel.consume(Constants.QUEUE_SMS, async (msg: amqp.ConsumeMessage) => {
            rabbitMQChannel.ack(msg);
            const payload: SendSMSPayload = JSON.parse(msg.content.toString());
            await sendSMSWorker.run(payload);
        });
    }

    async test() {}
}
