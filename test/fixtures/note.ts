import { PrismaClient, Note } from "@prisma/client";
import faker from "faker";

const prisma = new PrismaClient();

export default async function createFakeNote(
    roomId: number,
    title?: string,
    content?: string
): Promise<Note> {
    return prisma.note.create({
        data: {
            roomId,
            title: title || faker.name.jobTitle(),
            content: content || faker.name.jobTitle(),
            //content: content || faker.lorem.paragraphs(1),
        },
    });
}
