import { Message, Room, DeviceMessage } from "@prisma/client";

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
    const roomUsers = await global.prisma.roomUser.findMany({ where: { roomId: room.id } });

    const devices = await global.prisma.device.findMany({
        where: {
            userId: { in: roomUsers.map((u) => u.userId) },
        },
    });

    const message = await global.prisma.message.create({
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
            modifiedAt,
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
    modifiedAt,
}: {
    fromUserId: number;
    fromDeviceId: number;
    messageId: number;
    deviceId: number;
    userId: number;
    modifiedAt?: Date;
}): Promise<DeviceMessage> {
    return global.prisma.deviceMessage.create({
        data: {
            fromUserId,
            fromDeviceId,
            messageId,
            body: {},
            deviceId,
            userId,
            action: "action",
            modifiedAt,
        },
    });
}
