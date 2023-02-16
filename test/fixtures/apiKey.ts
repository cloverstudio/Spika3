import { ApiKey } from "@prisma/client";
import faker from "faker";
import global from "../global";

export default async function createFakeApiKey(
    roomId: number,
    displayName?: string
): Promise<ApiKey> {
    const botUser = await global.prisma.user.create({
        data: {
            displayName: displayName || faker.name.middleName(),
            isBot: true,
        },
    });

    return global.prisma.apiKey.create({
        data: {
            roomId,
            userId: botUser.id,
            token: faker.random.word(),
        },
    });
}
