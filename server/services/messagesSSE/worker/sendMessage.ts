import QueueWorkerInterface from "../../types/queueWorkerInterface";
import { SendMessageSSEPayload } from "../../types/queuePayloadTypes";
import { warn as lw } from "../../../components/logger";
import {
    LAST_MESSAGE_PREFIX,
    MESSAGE_ACTION_NEW_MESSAGE,
    PUSH_TYPE_NEW_MESSAGE,
    PUSH_TYPE_NEW_MESSAGE_RECORD,
    QUEUE_PUSH,
    QUEUE_SSE,
    UNREAD_PREFIX,
} from "../../../components/consts";
import { Channel } from "amqplib";
import sanitize from "../../../components/sanitize";
import prisma from "../../../components/prisma";
import dayjs from "dayjs";
import { getRoomUnreadCount } from "../../messenger/route/room";
import createSSEMessageRecordsNotify from "../../messenger/lib/sseMessageRecordsNotify";
import { createClient } from "redis";

class sendMessageWorker implements QueueWorkerInterface {
    async run(
        payload: SendMessageSSEPayload,
        rabbitMQChannel: Channel,
        redisClient: ReturnType<typeof createClient>,
    ) {
        const sseMessageRecordsNotify = createSSEMessageRecordsNotify(rabbitMQChannel);

        try {
            const { room, message } = payload;

            const allReceivers = room.users;
            const senderRoomUser =
                message.type !== "system_text" &&
                allReceivers.find((u) => u.userId === message.fromUserId);
            const sender = senderRoomUser?.user;
            const { fromUserId, fromDeviceId, body, roomId } = message;

            const usersWhoBlockedSender =
                room.type === "private" && message.type !== "system_text"
                    ? await prisma.block.findMany({
                          where: {
                              userId: { in: allReceivers.map((u) => u.userId) },
                              blockedId: fromUserId,
                          },
                          select: { userId: true },
                      })
                    : [];

            const receivers = allReceivers.filter(
                (u) => !usersWhoBlockedSender.map((u) => u.userId).includes(u.userId),
            );

            const devices = await prisma.device.findMany({
                where: {
                    userId: { in: receivers.map((u) => u.userId) },
                },
            });

            await prisma.deviceMessage.createMany({
                data: devices
                    .filter((d) => d.id !== fromDeviceId)
                    .map((device) => ({
                        deviceId: device.id,
                        userId: device.userId,
                        fromUserId,
                        fromDeviceId,
                        body,
                        action: MESSAGE_ACTION_NEW_MESSAGE,
                        messageId: message.id,
                    })),
            });

            await Promise.all(
                receivers.map(async ({ userId, createdAt }) => {
                    await getRoomUnreadCount({
                        roomId,
                        userId,
                        redisClient,
                        roomUserCreatedAt: createdAt,
                    });

                    const key = `${UNREAD_PREFIX}${roomId}_${userId}`;
                    if (userId !== fromUserId) {
                        await redisClient.incr(key);
                    }
                }),
            );

            const key = `${LAST_MESSAGE_PREFIX}${roomId}`;
            await redisClient.set(key, message.id.toString());

            function getRoomAvatarFileId(room: SendMessageSSEPayload["room"], userId: number) {
                if (room.type === "group") {
                    return room.avatarFileId;
                }
                const otherUser = room.users.find((u) => u.userId !== userId);

                if (!otherUser) {
                    return 0;
                }

                return otherUser.user.avatarFileId;
            }

            while (devices.length) {
                await Promise.all(
                    devices.splice(0, 10).map(async (device) => {
                        if (!device) {
                            return;
                        }

                        if (device.id === fromDeviceId && message.type !== "system_text") {
                            return;
                        }

                        const checkIfShouldSendPush = () => {
                            const tokenExpiredAtTS = +dayjs(device.tokenExpiredAt);
                            const now = +dayjs();

                            if (now > tokenExpiredAtTS) {
                                return false;
                            }

                            if (
                                message.fromUserId === device.userId &&
                                device.osName === "android"
                            ) {
                                return true;
                            }

                            if (
                                message.fromUserId === device.userId &&
                                message.type !== "system_text"
                            ) {
                                return false;
                            }

                            return true;
                        };

                        if (checkIfShouldSendPush()) {
                            const roomAvatarFileId = getRoomAvatarFileId(room, device.userId);

                            rabbitMQChannel.sendToQueue(
                                QUEUE_PUSH,
                                Buffer.from(
                                    JSON.stringify({
                                        type: PUSH_TYPE_NEW_MESSAGE,
                                        token: device.pushToken,
                                        data: {
                                            message,
                                            user: sanitize(sender).user(),
                                            ...(room.type === "group" && {
                                                groupName: room.name,
                                            }),
                                            toUserId: device.userId,
                                            roomUserCreatedAt: senderRoomUser.createdAt,
                                            roomAvatarFileId,
                                        },
                                    }),
                                ),
                            );
                        }

                        rabbitMQChannel.sendToQueue(
                            QUEUE_SSE,
                            Buffer.from(
                                JSON.stringify({
                                    channelId: device.id,
                                    data: {
                                        type: PUSH_TYPE_NEW_MESSAGE,
                                        message: message,
                                    },
                                }),
                            ),
                        );
                    }),
                );
            }

            const messageRecordsNotifyData = {
                types: ["delivered", "seen"],
                userId: fromUserId,
                messageIds: [message.id],
                pushType: PUSH_TYPE_NEW_MESSAGE_RECORD,
            };

            sseMessageRecordsNotify(messageRecordsNotifyData);
        } catch (error) {
            lw("sendMessage failed");
        }
    }
}

export default new sendMessageWorker();
