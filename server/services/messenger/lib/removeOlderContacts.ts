import prisma from "../../../components/prisma";

export default function removeOlderContacts(userId: number) {
    const tenMinutes = 10 * 60 * 1000;

    return prisma.contact.deleteMany({
        where: {
            userId,
            lastConfirmedAt: {
                lte: new Date(+new Date() - tenMinutes),
            },
        },
    });
}
