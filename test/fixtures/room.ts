import { Room } from "@prisma/client";

export default async function createFakeRoom(users?: any, overrides?: any): Promise<Room> {
    return global.prisma.room.create({
        data: {
            name: "name",
            type: "type",
            ...(users.length && {
                users: { create: users },
            }),
            ...overrides,
        },
    });
}
