import { MessageRecord } from "@prisma/client";

export default async function createFakeMessageRecord({
    messageId,
    userId,
    type,
}: {
    messageId: number;
    userId: number;
    type: string;
}): Promise<MessageRecord> {
    const message = await global.prisma.messageRecord.create({
        data: {
            type,
            messageId,
            userId,
        },
    });

    return message;
}
