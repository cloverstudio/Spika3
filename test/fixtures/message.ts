import { PrismaClient, Message, Room, DeviceMessage } from "@prisma/client";

const prisma = new PrismaClient();

export default async function createFakeMessage({
    fromUserId,
    fromDeviceId,
    room,
    type = "text",
    modifiedAt,
}: {
    fromUserId: number;
    fromDeviceId: number;
    room: Room;
    type?: string;
    modifiedAt?: Date;
}): Promise<Message> {
    const roomUsers = await prisma.roomUser.findMany({ where: { roomId: room.id } });

    const devices = await prisma.device.findMany({
        where: {
            userId: { in: roomUsers.map((u) => u.userId) },
        },
    });

    const message = await prisma.message.create({
        data: {
            type,
            roomId: room.id,
            fromDeviceId,
            fromUserId,
            totalUserCount: roomUsers.length,
            modifiedAt,
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
