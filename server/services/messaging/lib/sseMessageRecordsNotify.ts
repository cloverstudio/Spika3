import amqp from "amqplib";

import * as Constants from "../../../components/consts";
import { warn as lw } from "../../../components/logger";
import { SendMessageRecordSSEPayload } from "../../types/queuePayloadTypes";

export default function createSSEMessageRecordsNotify(
    rabbitMQChannel: amqp.Channel | undefined | null
) {
    return async (data: SendMessageRecordSSEPayload): Promise<void> => {
        if (data.types.includes("reaction") && !data.reaction) {
            lw("SSEMessageRecordsPayload missing reaction, can't send");
            return;
        }

        rabbitMQChannel.sendToQueue(
            Constants.QUEUE_MESSAGE_RECORDS_SSE,
            Buffer.from(JSON.stringify(data))
        );
    };
}
