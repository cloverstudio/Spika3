import { MessageRecord, PrismaClient } from "@prisma/client";
import amqp from "amqplib";

import * as Constants from "../../../components/consts";

const prisma = new PrismaClient();

export default async function sseMessageRecordsNotify(
    records: Partial<
        Omit<MessageRecord, "createdAt" | "modifiedAt"> & {
            createdAt: number;
            deleted?: boolean;
        }
    >[],
    rabbitMQChannel: amqp.Channel | undefined | null
): Promise<void> {
    for (const record of records) {
        const deviceIds = await getDeviceIdsFromMessageId(record.messageId);

        for (const deviceId of deviceIds) {
            rabbitMQChannel.sendToQueue(
                Constants.QUEUE_SSE,
                Buffer.from(
                    JSON.stringify({
                        channelId: deviceId,
                        data: {
                            type: record.deleted
                                ? Constants.PUSH_TYPE_DELETED_MESSAGE_RECORD
                                : Constants.PUSH_TYPE_NEW_MESSAGE_RECORD,
                            messageRecord: record,
                        },
                    })
                )
            );
        }
    }
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
