import amqp from "amqplib";
import { createClient } from "redis";

import * as Constants from "../../../components/consts";
import { SendMessageRecordSSEPayload } from "../../types/queuePayloadTypes";

export default function createSSEMessageRecordsNotify(
    rabbitMQChannel: amqp.Channel | undefined | null,
    redisClient: ReturnType<typeof createClient>
) {
    return async (data: SendMessageRecordSSEPayload): Promise<void> => {

        //if types includes reaction then skip filtering
        if (data.types.includes("reaction"))
            rabbitMQChannel.sendToQueue(
                Constants.QUEUE_MESSAGE_RECORDS_SSE,
                Buffer.from(JSON.stringify(data))
            );
        else {
            const dataFiltered = await filterDataIfCurrentlyInProcess(data);
            for (const data of dataFiltered) {
                rabbitMQChannel.sendToQueue(
                    Constants.QUEUE_MESSAGE_RECORDS_SSE,
                    Buffer.from(JSON.stringify(data))
                );
            }
        }


        // rabbitMQChannel.sendToQueue(
        //     Constants.QUEUE_MESSAGE_RECORDS_SSE,
        //     Buffer.from(JSON.stringify(data))
        // );

        // rabbitMQChannel.sendToQueue(
        //     Constants.QUEUE_MESSAGE_RECORDS_SSE,
        //     Buffer.from(JSON.stringify(data))
        // );

        /*
        rabbitMQChannel.sendToQueue(
            "test",
            Buffer.from(JSON.stringify(data))
        );
 
        rabbitMQChannel.consume(
            Constants.QUEUE_MESSAGE_RECORDS_SSE,
            async (msg: amqp.ConsumeMessage) => {
                console.log("test")
            },
            { noAck: false },
        );
        */

    };

    async function filterDataIfCurrentlyInProcess(data: SendMessageRecordSSEPayload): Promise<Array<object>> {
        const dataFiltered = [{
            types: ["seen"],
            messageIds: [],
            userId: data.userId,
            pushType: data.pushType,
        },
        {
            types: ["delivered"],
            messageIds: [],
            userId: data.userId,
            pushType: data.pushType,
        }];


        for (const messageId of data.messageIds) {
            for (const type of data.types) {
                const key = `${Constants.ROOM_USER_TPYE_RECORD_PREFIX}${data.userId}_${messageId}_${type}`;

                const isMessageSaved = await redisClient.set(key, 1, {
                    EX: Constants.MESSAGE_RECORD_REDIS_EXPIRY_TIME,
                    NX: true, // Only set the key if it does not already exist
                });

                if (isMessageSaved) {

                    if (type === "seen") {
                        dataFiltered[0].messageIds.push(messageId);
                    }
                    else if (type === "delivered") {
                        dataFiltered[1].messageIds.push(messageId);
                    }
                }
                console.log(`isMessageSaved:`, isMessageSaved);
            }
        }
        return dataFiltered;
    }
}


