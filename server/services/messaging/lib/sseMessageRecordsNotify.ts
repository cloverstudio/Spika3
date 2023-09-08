import amqp from "amqplib";

import * as Constants from "../../../components/consts";
import { SendMessageRecordSSEPayload } from "../../types/queuePayloadTypes";

export default function createSSEMessageRecordsNotify(
    rabbitMQChannel: amqp.Channel | undefined | null
) {
    return async (data: SendMessageRecordSSEPayload): Promise<void> => {
        rabbitMQChannel.sendToQueue(
            Constants.QUEUE_MESSAGE_RECORDS_SSE,
            Buffer.from(JSON.stringify(data))
        );
    };
}
