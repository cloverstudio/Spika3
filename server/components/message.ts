import prisma from "./prisma";

export async function formatMessageBody(
    body: any,
    messageType: string,
    fullPath?: boolean
): Promise<any> {
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

    if (fullPath) {
        if (file && file.path) {
            file.path = `${process.env.UPLOADS_BASE_URL}${file.path}`;
        }

        if (thumb && thumb.path) {
            thumb.path = `${process.env.UPLOADS_BASE_URL}${thumb.path}`;
        }
    }

    return { ...body, file, thumb };
}
