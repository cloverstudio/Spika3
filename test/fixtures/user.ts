import { PrismaClient, User } from "@prisma/client";
import crypto from "crypto";
import faker from "faker";

const prisma = new PrismaClient();

export default async function createFakeUser(overrides?: any): Promise<User> {
    const telephoneNumber = `+385${faker.datatype.number({ min: 911111111, max: 999999999 })}`;
    const shasum = crypto.createHash("sha1");
    shasum.update(telephoneNumber);
    const telephoneNumberHashed = shasum.digest("hex");
    const countryCode = `385`;

    const user = {
        telephoneNumber,
        telephoneNumberHashed,
        countryCode,
        verified: true,
        ...(overrides && { ...overrides }),
    };

    return prisma.user.create({ data: user });
}

export async function createManyFakeUsers(count: number): Promise<User[]> {
    return Promise.all(
        Array(count)
            .fill(true)
            .map(() => createFakeUser())
    );
}
