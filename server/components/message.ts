import prisma from "./prisma";

export async function formatMessageBody(body: any, messageType: string): Promise<any> {
    if (messageType === "text") {
        return body;
    }

    const file = await prisma.file.findFirst({
        where: {
            id: body.fileId,
        },
        select: {
            id: true,
            fileName: true,
            mimeType: true,
            size: true,
            metaData: true,
        },
    });

    const thumb = await prisma.file.findFirst({
        where: {
            id: body.thumbId,
        },
        select: {
            id: true,
            fileName: true,
            mimeType: true,
            size: true,
            metaData: true,
        },
    });

    return { ...body, file, thumb };
}
