import { PrismaClient } from "@prisma/client";
import QueueWorkerInterface from "../../types/queueWorkerInterface";
import { SendMessageRecordSSEPayload } from "../../types/queuePayloadTypes";
import { warn as lw } from "../../../components/logger";
import { QUEUE_SSE } from "../../../components/consts";
import { Channel } from "amqplib";
import sanitize, { SanitizedMessageRecord } from "../../../components/sanitize";

const prisma = new PrismaClient();

class sendMessageRecordWorker implements QueueWorkerInterface {
    async run(payload: SendMessageRecordSSEPayload, channel: Channel) {
        try {
            const { types, userId, messageIds, pushType, reaction, justNotify = false } = payload;

            const messageRecords: SanitizedMessageRecord[] = [];

            for (const messageId of messageIds) {
                for (const type of types) {
                    let record = await prisma.messageRecord.findUnique({
                        where: {
                            messageId_userId_type_unique_constraint: {
                                messageId,
                                type,
                                userId,
                            },
                        },
                    });

                    if (justNotify) {
                        if (record) {
                            messageRecords.push(sanitize(record).messageRecord());
                        } else {
                            lw("Can't find messageRecord to justNotify about it!");
                        }
                        continue;
                    }

                    if (!record) {
                        try {
                            record = await prisma.messageRecord.create({
                                data: {
                                    type,
                                    userId,
                                    messageId,
                                    ...(type === "reaction" && { reaction }),
                                },
                            });

                            if (["delivered", "seen"].includes(type)) {
                                await prisma.message.update({
                                    where: { id: messageId },
                                    data: {
                                        ...(type === "seen" && { seenCount: { increment: 1 } }),
                                        ...(type === "delivered" && {
                                            deliveredCount: { increment: 1 },
                                        }),
                                    },
                                });
                            }

                            messageRecords.push(sanitize(record).messageRecord());
                        } catch (error) {
                            console.error({ error });
                        }
                    }
                }
            }

            for (const record of messageRecords) {
                const deviceIds = await getDeviceIdsFromMessageId(record.messageId);

                for (const deviceId of deviceIds) {
                    channel.sendToQueue(
                        QUEUE_SSE,
                        Buffer.from(
                            JSON.stringify({
                                channelId: deviceId,
                                data: {
                                    type: pushType,
                                    messageRecord: record,
                                },
                            })
                        )
                    );
                }
            }
        } catch (error) {
            console.error({ sendMessageRecordWorkerError: error });
            lw("sendMessageRecordWorker failed");
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

export default new sendMessageRecordWorker();
