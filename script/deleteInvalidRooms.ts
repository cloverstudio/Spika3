// convert rooms
import { PrismaClient } from "@prisma/client";
const prisma: PrismaClient =
    global.prisma ||
    new PrismaClient({
        log: [
            {
                emit: "event",
                level: "query",
            },
        ],
    });

(async () => {
    const rooms = await prisma.room.findMany({ include: { users: true } });

    console.log("All rooms length: ", rooms.length);
    console.log(
        "All private rooms length: ",
        rooms.filter((room) => room.type === "private").length
    );
    console.log(
        "All private rooms with users length of less than 2: ",
        rooms.filter((room) => room.type === "private" && room.users.length < 2).length
    );

    const problematicRooms = rooms
        .filter((room) => room.type === "private" && room.users.length < 2)
        .map((room) => room.id);

    for (const roomId of problematicRooms) {
        const messages = await prisma.message.findMany({
            where: {
                roomId,
            },
            include: {
                messageRecords: true,
                deviceMessages: true,
            },
        });

        for (const message of messages) {
            if (message.messageRecords.length > 0) {
                await prisma.messageRecord.deleteMany({
                    where: {
                        messageId: message.id,
                    },
                });
            }

            if (message.deviceMessages.length > 0) {
                await prisma.deviceMessage.deleteMany({
                    where: {
                        messageId: message.id,
                    },
                });
            }

            await prisma.message.delete({
                where: {
                    id: message.id,
                },
            });
        }

        await prisma.roomUser.deleteMany({
            where: {
                roomId,
            },
        });

        await prisma.room.delete({
            where: {
                id: roomId,
            },
        });
    }
})();
