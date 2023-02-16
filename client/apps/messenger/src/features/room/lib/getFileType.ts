export default function getFileType(htmlType: string): string {
    if (!htmlType) {
        return "file";
    }

    if (htmlType.startsWith("image/")) {
        return "image";
    }

    if (htmlType.startsWith("audio/")) {
        return "audio";
    }

    if (htmlType.startsWith("video/")) {
        return "video";
    }

    return "file";
}
