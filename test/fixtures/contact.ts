import { PrismaClient, User, Prisma } from "@prisma/client";

export default async function createFakeContacts({
    userId,
    contacts,
}: {
    userId: number;
    contacts: User[];
}): Promise<Prisma.BatchPayload> {
    return global.prisma.contact.createMany({
        data: contacts.map((u) => ({ userId, contactId: u.id })),
    });
}
