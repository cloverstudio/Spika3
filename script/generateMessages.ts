import prisma from "../server/components/prisma";
import faker from "faker";

async function main() {
    const users = await prisma.user.findMany();

    for (let i = 0; i < users.length; i++) {
        const userId = users[i].id;

        const num = Math.ceil(Math.random() * 10);

        for (let index = 0; index < num; index++) {
            const createdAt = faker.date.past(Math.random() * 100);

            const room = await prisma.room.create({
                data: {
                    name: "bd",
                    type: "private",
                    avatarUrl: "",
                    createdAt,
                },
            });

            await prisma.message
                .create({
                    data: {
                        roomId: room.id,
                        type:
                            Math.random() > 0.5 ? "audio" : Math.random() > 0.5 ? "file" : "image",
                        createdAt,
                        fromUserId: userId,
                        totalUserCount: 5,
                    },
                })
                .catch(console.error);
        }
    }
}

main();
