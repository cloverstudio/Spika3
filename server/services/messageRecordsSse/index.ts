import amqp from "amqplib";

import * as Constants from "../../components/consts";
import Service, { ServiceStartParams } from "../types/serviceInterface";
import { SendMessageRecordSSEPayload } from "../types/queuePayloadTypes";

import sendMessageRecordWorker from "./worker/sendMessageRecord";

export default class MessageRecordsSSEService implements Service {
    async start({ rabbitMQChannel, redisClient }: ServiceStartParams): Promise<void> {

        await rabbitMQChannel.assertQueue(Constants.QUEUE_MESSAGE_RECORDS_SSE, {
            durable: false,
            autoDelete: false,
        });
        
        rabbitMQChannel.consume(
            Constants.QUEUE_MESSAGE_RECORDS_SSE,
            async (msg: amqp.ConsumeMessage) => {
                const payload: SendMessageRecordSSEPayload = JSON.parse(msg.content.toString());

                console.log("consumed record queue");

                if(payload.types[0] == "reaction"){
                    console.log("consumed reaction queue");
                }
                 
                await sendMessageRecordWorker.run(payload, rabbitMQChannel);
                rabbitMQChannel.ack(msg);
            },
            { noAck: false },
        );
    }

    async test() {}
}
