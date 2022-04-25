import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function formatMessageBody(body: any, messageType: string): Promise<any> {
    if (messageType === "text") {
        return body;
    }

    const file = await prisma.file.findFirst({
        where: {
            id: body.fileId,
        },
        select: {
            fileName: true,
            mimeType: true,
            path: true,
            size: true,
        },
    });

    const thumb = await prisma.file.findFirst({
        where: {
            id: body.thumbId,
        },
        select: {
            fileName: true,
            mimeType: true,
            path: true,
            size: true,
        },
    });

    return { ...body, file, thumb };
}
