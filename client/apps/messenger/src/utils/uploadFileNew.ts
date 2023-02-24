import { dynamicBaseQuery } from "../api/api";
import { getImageDimension, getVideoInfo } from "./media";

function uploadChunk({
    chunk,
    offset,
    clientId,
}: {
    chunk: string;
    offset: number;
    clientId: string;
}) {
    return dynamicBaseQuery({
        url: "/upload/files",
        method: "POST",
        data: {
            chunk,
            offset,
            clientId,
        },
    });
}

function finalizeUpload({
    hash,
    total,
    file,
    type,
    relationId,
    clientId,
    metaData,
}: {
    hash: string;
    total: number;
    file: File;
    type: string;
    relationId: number;
    clientId: string;
    metaData: any;
}) {
    return dynamicBaseQuery({
        url: "/upload/files/verify",
        method: "POST",
        data: {
            total,
            size: file.size,
            mimeType: file.type || type || "unknown",
            fileName: file.name,
            type,
            fileHash: hash,
            relationId,
            clientId,
            metaData,
        },
    });
}

type UploadFileType = {
    file: File;
    type: string;
    relationId?: number;
    onProgress?: (progress: number) => void;
};

type UploadFileReturnType = {
    path: string;
    id: number;
};

export default async function uploadFile(params: UploadFileType): Promise<UploadFileReturnType> {
    const { file, type, relationId, onProgress } = params;

    const clientId = String(Math.round(Math.random() * 100000000));
    const chunkSize = Math.ceil(file.size / 100);

    const total = Math.ceil(file.size / chunkSize);

    let uploaded = 0;

    let metaData: { duration: number; width: number; height: number } = null;

    if (/^.*image.*$/.test(type)) {
        const dimension = await getImageDimension(file);
        metaData = { ...metaData, ...dimension };
    }
    if (/^.*video.*$/.test(type)) {
        const videoInfo = await getVideoInfo(file);
        metaData = { ...metaData, ...videoInfo };
    }

    const uploadChunksWorker = new Worker(new URL("./readChunksWorker.ts", import.meta.url), {
        type: "module",
    });

    const hashPromise = createFileHash(file);

    await new Promise((resolve, reject) => {
        uploadChunksWorker.onmessage = async (e) => {
            if (e.data.type !== "chunk") {
                return;
            }
            const { chunk, offset } = e.data.data;

            await uploadChunk({ chunk, offset: offset / chunkSize, clientId });
            uploaded++;
            onProgress((uploaded / total) * 100);

            if (uploaded === total) {
                resolve(true);
                uploadChunksWorker.terminate();
                return;
            }
        };

        uploadChunksWorker.onerror = (e) => {
            console.log({ e: e.message });
            reject(e.message);
        };

        uploadChunksWorker.postMessage({ file });
    });

    console.log("verify started");
    const hash = await hashPromise;
    console.log({ hash });
    const uploadedFile = await finalizeUpload({
        hash,
        total,
        file,
        type,
        relationId,
        clientId,
        metaData,
    }).then((res) => res.data.file);

    return uploadedFile;
}

async function createFileHash(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const hashFileWorker = new Worker(new URL("./hashFileWorker.ts", import.meta.url), {
            type: "module",
        });

        hashFileWorker.onmessage = (e) => {
            if (e.data.hash) {
                resolve(e.data.hash);
            }
        };

        hashFileWorker.onerror = (e) => {
            reject(e.message);
        };

        hashFileWorker.postMessage({ file });
    });
}
