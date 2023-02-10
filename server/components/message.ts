import prisma from "./prisma";

export async function formatMessageBody(body: any, messageType: string): Promise<any> {
    if (messageType === "text") {
        return body;
    }

    const formatted = { ...body };

    if (body.fileId) {
        const file = await prisma.file.findUnique({
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

        formatted.file = file;
    }

    if (body.thumbId) {
        const thumb = await prisma.file.findUnique({
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

        formatted.thumb = thumb;
    }

    return formatted;
}
