import { PrismaClient } from "@prisma/client";
import amqp from "amqplib";

import * as Constants from "../../../components/consts";
import { SanitizedMessageRecord } from "../../../components/sanitize";

const prisma = new PrismaClient();

export default function createSSEMessageRecordsNotify(
    rabbitMQChannel: amqp.Channel | undefined | null
) {
    return async (records: SanitizedMessageRecord[], type: string): Promise<void> => {
        for (const record of records) {
            const deviceIds = await getDeviceIdsFromMessageId(record.messageId);

            for (const deviceId of deviceIds) {
                rabbitMQChannel.sendToQueue(
                    Constants.QUEUE_SSE,
                    Buffer.from(
                        JSON.stringify({
                            channelId: deviceId,
                            data: {
                                type,
                                messageRecord: record,
                            },
                        })
                    )
                );
            }
        }
    };
}

async function getDeviceIdsFromMessageId(messageId: number): Promise<number[]> {
    const message = await prisma.message.findUnique({
        where: { id: messageId },
        select: {
            room: {
                select: {
                    users: { select: { user: { select: { device: { select: { id: true } } } } } },
                },
            },
        },
    });

    return message.room.users.reduce(
        (acc, curr) => [...acc, ...curr.user.device.map((d) => d.id)],
        []
    );
}
