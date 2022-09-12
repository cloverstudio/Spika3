import { PrismaClient } from "@prisma/client";
import amqp from "amqplib";

import * as Constants from "../../../components/consts";
import { SanitizedRoomType } from "../../../components/sanitize";

const prisma = new PrismaClient();

export default function createSSERoomsNotify(rabbitMQChannel: amqp.Channel | undefined | null) {
    return async (room: SanitizedRoomType, type: string): Promise<void> => {
        const deviceIds = await getDeviceIdsFromUsersIds(room.users.map((u) => u.userId));

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
                    })
                )
            );
        }
    };
}

async function getDeviceIdsFromUsersIds(usersIds: number[]): Promise<number[]> {
    const devices = await prisma.device.findMany({
        where: { userId: { in: usersIds } },
        select: {
            id: true,
        },
    });

    return devices.map((d) => d.id);
}
