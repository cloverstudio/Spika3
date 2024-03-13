import prisma from "./prisma";
import ogs from "open-graph-scraper";

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

export async function getLinkThumbnailData(url: string) {
    if (typeof url !== "string" || !isValidURL(url)) {
        return null;
    }

    try {
        const { result } = await ogs({ url });

        if (!result || !result.success || !result.ogTitle) {
            return null;
        }

        return {
            title: result.ogTitle,
            description: result?.ogDescription || null,
            image: result.ogImage?.length > 0 ? result.ogImage[0].url : null,
            icon: result.favicon || null,
            url,
        };
    } catch (error) {
        return null;
    }
}

function isValidURL(url: string) {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
}
