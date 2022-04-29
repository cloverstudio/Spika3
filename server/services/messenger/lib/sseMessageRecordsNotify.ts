import { MessageRecord, PrismaClient } from "@prisma/client";
import amqp from "amqplib";

import * as Constants from "../../../components/consts";

const prisma = new PrismaClient();

export default async function sseMessageRecordsNotify(
    records: Partial<
        Omit<MessageRecord, "createdAt" | "modifiedAt"> & {
            createdAt: number;
        }
    >[],
    rabbitMQChannel: amqp.Channel | undefined | null
): Promise<void> {
    for (const record of records) {
        const devices = await prisma.deviceMessage.findMany({
            where: { messageId: record.messageId },
            select: { deviceId: true },
        });
        const deviceIds = devices.map((d) => d.deviceId);

        for (const deviceId of deviceIds) {
            rabbitMQChannel.sendToQueue(
                Constants.QUEUE_SSE,
                Buffer.from(
                    JSON.stringify({
                        channelId: deviceId,
                        data: {
                            type: Constants.PUSH_TYPE_NEW_MESSAGE,
                            messageRecord: record,
                        },
                    })
                )
            );
        }
    }
}
