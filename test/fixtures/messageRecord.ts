import { PrismaClient, MessageRecord } from "@prisma/client";

const prisma = new PrismaClient();

export default async function createFakeMessageRecord({
    messageId,
    userId,
    type,
}: {
    messageId: number;
    userId: number;
    type: string;
}): Promise<MessageRecord> {
    const message = await prisma.messageRecord.create({
        data: {
            type,
            messageId,
            userId,
        },
    });

    return message;
}
