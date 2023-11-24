import amqp from "amqplib";

import * as Constants from "../../../components/consts";
import prisma from "../../../components/prisma";
import { SanitizedRoomType } from "../../../components/sanitize";

export default function createSSERoomsNotify(rabbitMQChannel: amqp.Channel | undefined | null) {
    return async (room: SanitizedRoomType, type: string): Promise<void> => {
        const deviceIds = await getDeviceIdsFromUserIds(room.users.map((u) => u.userId));

        for (const deviceId of deviceIds) {
            rabbitMQChannel.sendToQueue(
                Constants.QUEUE_SSE,
                Buffer.from(
                    JSON.stringify({
                        channelId: deviceId,
                        data: {
                            type,
                            room,
                        },
                    }),
                ),
            );
        }
    };
}

async function getDeviceIdsFromUserIds(userIds: number[]): Promise<number[]> {
    const devices = await prisma.device.findMany({
        where: { userId: { in: userIds } },
        select: {
            id: true,
        },
    });

    return devices.map((d) => d.id);
}
