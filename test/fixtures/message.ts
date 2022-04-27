import { PrismaClient, Message, Room, DeviceMessage } from "@prisma/client";

const prisma = new PrismaClient();

export default async function createFakeMessage({
    fromUserId,
    fromDeviceId,
    room,
}: {
    fromUserId: number;
    fromDeviceId: number;
    room: Room;
}): Promise<Message> {
    const roomUsers = await prisma.roomUser.findMany({ where: { roomId: room.id } });

    const devices = await prisma.device.findMany({
        where: {
            userId: { in: roomUsers.map((u) => u.userId) },
        },
    });

    const message = await prisma.message.create({
        data: {
            type: "text",
            roomId: room.id,
            fromDeviceId,
            fromUserId,
            totalUserCount: roomUsers.length,
        },
    });

    for (const device of devices) {
        await createFakeDeviceMessage({
            fromUserId,
            fromDeviceId,
            messageId: message.id,
            deviceId: device.id,
            userId: device.userId,
        });
    }

    return message;
}

async function createFakeDeviceMessage({
    fromUserId,
    fromDeviceId,
    messageId,
    deviceId,
    userId,
}: {
    fromUserId: number;
    fromDeviceId: number;
    messageId: number;
    deviceId: number;
    userId: number;
}): Promise<DeviceMessage> {
    return prisma.deviceMessage.create({
        data: {
            fromUserId,
            fromDeviceId,
            messageId,
            body: {},
            deviceId,
            userId,
            action: "action",
        },
    });
}
