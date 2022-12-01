import prisma from "../server/components/prisma";
import faker from "faker";

async function main() {
    for (let i = 0; i < 10000; i++) {
        const gender = Math.random() > 0.5 ? "male" : Math.random() > 0.5 ? "female" : "other";
        const firstName = faker.name.firstName(gender === "male" ? 0 : 1);
        const lastName = faker.name.lastName(gender === "male" ? 0 : 1);

        await prisma.user
            .create({
                data: {
                    verified: true,
                    avatarFileId: 0,
                    displayName: `${firstName} ${lastName}`,
                    firstName,
                    lastName,
                    country: faker.address.countryCode(),
                    city: faker.address.city(),
                    telephoneNumber: faker.phone.phoneNumber(),
                    telephoneNumberHashed: faker.phone.phoneNumber(),
                    emailAddress: faker.internet.email(),
                    dob: faker.date.past(Math.random() * 100),
                    gender,
                    createdAt: faker.date.past(Math.random() * 100),
                },
            })
            .catch(console.error);
    }
}

main();
