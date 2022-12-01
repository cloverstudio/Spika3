import prisma from "../server/components/prisma";
import faker from "faker";

async function main() {
    const users = await prisma.user.findMany();

    for (let i = 0; i < users.length; i++) {
        const userId = users[i].id;

        await prisma.userActivity
            .create({
                data: {
                    userId,
                    name: "get_history",
                    createdAt: faker.date.past(Math.random() * 100),
                },
            })
            .catch(console.error);
    }
}

main();
