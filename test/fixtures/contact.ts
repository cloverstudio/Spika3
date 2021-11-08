import { PrismaClient, User, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export default async function createFakeContacts({
  userId,
  contacts,
}: {
  userId: number;
  contacts: User[];
}): Promise<Prisma.BatchPayload> {
  return prisma.contact.createMany({
    data: contacts.map((u) => ({ userId, contactId: u.id })),
  });
}
