import { User } from "@prisma/client";
import crypto from "crypto";
import faker from "faker";

export default async function createFakeUser(overrides?: any): Promise<User> {
    const telephoneNumber = `+385${faker.datatype.number({ min: 911111111, max: 999999999 })}`;
    const shasum = crypto.createHash("sha256");
    shasum.update(telephoneNumber);
    const telephoneNumberHashed = shasum.digest("hex");
    const emailAddress = faker.internet.email();

    const user = {
        telephoneNumber,
        telephoneNumberHashed,
        emailAddress,
        verified: true,
        ...(overrides && { ...overrides }),
    };

    return global.prisma.user.create({ data: user });
}

export async function createManyFakeUsers(count: number): Promise<User[]> {
    return Promise.all(
        Array(count)
            .fill(true)
            .map(() => createFakeUser())
    );
}
