import amqp from "amqplib";

import * as Constants from "../../../components/consts";
import prisma from "../../../components/prisma";
import { SanitizedRoomType } from "../../../components/sanitize";
import { createClient } from "redis";
import { isRoomMuted, isRoomPinned, getRoomUnreadCount } from "../route/room";

export default function createSSERoomsNotify(
    rabbitMQChannel: amqp.Channel | undefined | null,
    redisClient: ReturnType<typeof createClient>
) {
    return async (room: SanitizedRoomType, type: string): Promise<void> => {
        const devices = await getDeviceIdsFromUsersIds(room.users.map((u) => u.userId));

        for (const device of devices) {
            const { id: deviceId, userId } = device;

            const roomUser = room.users.find((u) => u.userId === userId);

            const muted = await isRoomMuted({
                roomId: room.id,
                userId,
                redisClient,
            });

            const pinned = await isRoomPinned({
                roomId: room.id,
                userId,
                redisClient,
            });

            const unreadCount = await getRoomUnreadCount({
                roomId: room.id,
                userId,
                redisClient,
                roomUserCreatedAt: new Date(roomUser.createdAt),
            });

            rabbitMQChannel.sendToQueue(
                Constants.QUEUE_SSE,
                Buffer.from(
                    JSON.stringify({
                        channelId: deviceId,
                        data: {
                            type,
                            room: { ...room, muted, pinned, unreadCount },
                        },
                    })
                )
            );
        }
    };
}

export function createSSERoomsRemovedNotify(rabbitMQChannel: amqp.Channel | undefined | null) {
    return async (usersIds: number[], roomId: number): Promise<void> => {
        const devices = await getDeviceIdsFromUsersIds(usersIds);

        for (const device of devices) {
            const { id: deviceId } = device;

            rabbitMQChannel.sendToQueue(
                Constants.QUEUE_SSE,
                Buffer.from(
                    JSON.stringify({
                        channelId: deviceId,
                        data: {
                            type: Constants.PUSH_TYPE_REMOVED_FROM_ROOM,
                            roomId,
                        },
                    })
                )
            );
        }
    };
}

async function getDeviceIdsFromUsersIds(usersIds: number[]) {
    const devices = await prisma.device.findMany({
        where: { userId: { in: usersIds } },
        select: {
            id: true,
            userId: true,
        },
    });

    return devices;
}
