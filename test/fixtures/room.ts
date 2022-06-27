import { PrismaClient, Room } from "@prisma/client";

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
