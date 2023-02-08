import prisma from "../server/components/prisma";
import utils from "../server/components/utils";

(async () => {
    const mr = await prisma.messageRecord.deleteMany({
        where: {
            createdAt: {
                lt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 30),
            },
        },
    });

    /*   const roomUsers = await prisma.roomUser.findMany({
        where: {
            userId: 61,
        },

        include: { room: true, user: true },
    });

    const roomsIds = roomUsers.map((r) => r.room.id);

    const start = process.hrtime();

    const messages = await prisma.message.findMany({
        where: {
            roomId: { in: roomsIds },
        },
        distinct: ["roomId"],
        orderBy: {
            createdAt: "desc",
        },
    });
    console.log({ objects: messages.length });

    console.log(`[GET ROOMS] ${utils.getDurationInMilliseconds(start).toLocaleString()} ms`); */
})();
