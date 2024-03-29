import { Device } from "@prisma/client";
import faker from "faker";

export default async function createFakeDevice(userId: number): Promise<Device> {
    const deviceId = `${faker.datatype.number({ min: 911111111, max: 999999999 })}`;
    const token = `${faker.datatype.number({ min: 911111111, max: 999999999 })}`;

    return global.prisma.device.create({ data: { userId, deviceId, token } });
}

export async function createFakeDevices(userIds: number[]): Promise<Device[]> {
    return Promise.all(userIds.map((userId) => createFakeDevice(userId)));
}
