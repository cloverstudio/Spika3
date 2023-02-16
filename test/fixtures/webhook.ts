import { Webhook } from "@prisma/client";
import faker from "faker";
import global from "../global";

export default async function createFakeWebhook(
    roomId: number,
    url?: string,
    verifySignature?: string
): Promise<Webhook> {
    return global.prisma.webhook.create({
        data: {
            roomId,
            url: url || faker.internet.url(),
            verifySignature: verifySignature || faker.random.word(),
        },
    });
}
