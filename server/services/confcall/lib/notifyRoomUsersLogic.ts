import amqp from "amqplib";

import * as Constants from "../../../components/consts";
import prisma from "../../../components/prisma";

export default async (roomId: number, rabbitMQChannel: amqp.Channel, data: any): Promise<void> => {
    // get device list which belongs to the room
    const userIds = await prisma.roomUser.findMany({
        where: {
            roomId,
        },
        select: {
            userId: true,
        },
    });

    const deviceIds = await prisma.device.findMany({
        where: {
            userId: { in: userIds.map((obj) => obj.userId) },
        },
        select: {
            id: true,
        },
    });

    deviceIds.forEach((obj) => {
        const deviceId = obj.id;

        rabbitMQChannel.sendToQueue(
            Constants.QUEUE_SSE,
            Buffer.from(
                JSON.stringify({
                    channelId: deviceId,
                    data,
                })
            )
        );
    });
};
