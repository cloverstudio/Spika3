import { PrismaClient, Room, RoomUser } from "@prisma/client";
import faker from "faker";

const prisma = new PrismaClient();

export default async function createFakeRoom(users?: any, overrides?: any): Promise<Room> {
    return prisma.room.create({
        data: {
            name: "name",
            type: "type",
            avatarUrl: "avatarUrl",
            ...(users.length && {
                users: { create: users },
            }),
            ...overrides,
        },
    });
}
