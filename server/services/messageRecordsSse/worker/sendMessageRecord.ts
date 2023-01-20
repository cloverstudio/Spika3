import QueueWorkerInterface from "../../types/queueWorkerInterface";
import { SendMessageRecordSSEPayload } from "../../types/queuePayloadTypes";
import { warn as lw } from "../../../components/logger";
import { QUEUE_SSE } from "../../../components/consts";
import { Channel } from "amqplib";
import sanitize, { SanitizedMessageRecord } from "../../../components/sanitize";
import prisma from "../../../components/prisma";

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
                        include: { message: true },
                    });

                    if (justNotify) {
                        if (record) {
                            messageRecords.push(
                                sanitize({
                                    ...record,
                                    roomId: record.message.roomId,
                                }).messageRecord()
                            );
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
                                include: { message: true },
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

                            messageRecords.push(
                                sanitize({
                                    ...record,
                                    roomId: record.message.roomId,
                                }).messageRecord()
                            );
                        } catch (error) {
                            lw("create message record failed", error.message);
                        }
                    }
                }
            }

            for (const record of messageRecords) {
                const deviceIds = await getDeviceIdsFromMessageId(record.messageId, record.userId);

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
            lw("sendMessageRecordWorker failed");
        }
    }
}

async function getDeviceIdsFromMessageId(messageId: number, fromUserId: number): Promise<number[]> {
    const message = await prisma.message.findUnique({
        where: { id: messageId },
        select: {
            createdAt: true,
            fromUserId: true,
            room: {
                select: {
                    users: {
                        select: {
                            user: {
                                select: {
                                    device: { select: { id: true, createdAt: true } },
                                    id: true,
                                },
                            },
                        },
                    },
                    type: true,
                },
            },
        },
    });

    const usersWhoBlockedSender =
        message.room.type === "private"
            ? await prisma.block.findMany({
                  where: {
                      userId: { in: message.room.users.map((u) => u.user.id) },
                      blockedId: fromUserId,
                  },
                  select: { userId: true },
              })
            : [];

    return message.room.users
        .filter((u) => !usersWhoBlockedSender.map((m) => m.userId).includes(u.user.id))
        .reduce((acc, curr) => [...acc, ...curr.user.device], [])
        .filter((d) => +d.createdAt <= +message.createdAt)
        .map((d) => d.id);
}

export default new sendMessageRecordWorker();
