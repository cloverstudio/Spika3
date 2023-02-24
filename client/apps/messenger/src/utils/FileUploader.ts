import { dynamicBaseQuery } from "../api/api";
import generateThumbFile from "../features/room/lib/generateThumbFile";
import { getImageDimension, getVideoInfo, getVideoThumbnail } from "./media";

type FileUploaderConstructorType = {
    file: File;
    type: string;
    relationId?: number;
    onProgress?: (progress: number) => void;
};

export class FileUploader {
    file: File;
    type: string;
    relationId: number;
    onProgress: (progress: number) => void;
    clientId: string;
    hash: string;
    hashPromise: Promise<string>;
    chunksUploaded = 0;
    chunkSize: number;
    totalChunks: number;

    constructor({ file, type, relationId, onProgress }: FileUploaderConstructorType) {
        this.file = file;
        this.type = type;
        this.relationId = relationId;
        this.onProgress = onProgress;

        this.clientId = String(Math.round(Math.random() * 100000000));
        this.hashPromise = this.hashFile();
        this.chunkSize = this.getChunkSize();
        this.totalChunks = Math.ceil(file.size / this.chunkSize);
    }

    async upload(): Promise<{
        path: string;
        id: number;
    }> {
        await this.readChunks({
            onChunk: (chunk, start) => this.uploadChunk({ chunk, offset: start / this.chunkSize }),
        });

        return this.finalizeUpload();
    }

    readChunks({
        onChunk,
    }: {
        onChunk: (chunk: string, start: number) => Promise<void>;
    }): Promise<void> {
        const readChunksWorker = this.createWorker("./readChunksWorker.ts");

        return new Promise((resolve, reject) => {
            readChunksWorker.onmessage = async (e) => {
                const { chunk, start } = e.data;

                if (!chunk) {
                    return;
                }

                await onChunk(chunk, start);

                if (this.chunksUploaded === this.totalChunks) {
                    readChunksWorker.terminate();
                    resolve();
                }
            };

            readChunksWorker.onerror = (e) => {
                console.log({ e: e.message });
                readChunksWorker.terminate();
                reject(e.message);
            };

            readChunksWorker.postMessage({ file: this.file, chunkSize: this.chunkSize });
        });
    }

    async uploadChunk({ chunk, offset }: { chunk: string; offset: number }): Promise<void> {
        const { clientId, onProgress } = this;

        await dynamicBaseQuery({
            url: "/upload/files",
            method: "POST",
            data: {
                chunk,
                offset,
                clientId,
            },
        });

        this.chunksUploaded++;
        console.log({ this: this.chunksUploaded, total: this.totalChunks });
        if (onProgress) {
            onProgress(Math.round((this.chunksUploaded / this.totalChunks) * 100));
        }
    }

    hashFile(): Promise<string> {
        const hashFileWorker = this.createWorker("./hashFileWorker.ts");

        return new Promise((resolve, reject) => {
            hashFileWorker.onmessage = (e) => {
                if (e.data.hash) {
                    resolve(e.data.hash);
                } else {
                    reject("Hashing failed");
                }
            };

            hashFileWorker.onerror = (e) => {
                reject(e.message);
            };

            hashFileWorker.postMessage({ file: this.file });
        });
    }

    async finalizeUpload(): Promise<{
        path: string;
        id: number;
    }> {
        const fileHash = await this.hashPromise;
        const metaData = await this.getMetaData();

        const { data } = await dynamicBaseQuery({
            url: "/upload/files/verify",
            method: "POST",
            data: {
                total: this.totalChunks,
                size: this.file.size,
                mimeType: this.file.type || this.type || "unknown",
                fileName: this.file.name,
                type: this.type,
                relationId: this.relationId,
                clientId: this.clientId,
                fileHash,
                metaData,
            },
        });

        return data.file;
    }

    createWorker(relativeFilePath: string) {
        return new Worker(new URL(relativeFilePath, import.meta.url), {
            type: "module",
        });
    }

    getChunkSize(): number {
        const FIVE_MB = 5 * 1024 * 1024;
        const ONE_MB = 1024 * 1024;

        if (this.file.size < FIVE_MB) {
            return ONE_MB;
        } else {
            return Math.ceil(this.file.size / 100);
        }
    }

    getMetaData() {
        console.log(this.file.type);
        if (/^.*image*$/.test(this.file.type)) {
            return getImageDimension(this.file);
        }

        if (/^.*video*$/.test(this.file.type)) {
            return getVideoInfo(this.file);
        }
    }

    createThumbnailFile() {
        console.log(this.file.type);

        const time = performance.now();
        if (/video/.test(this.file.type)) {
            console.log("createVIDEOThumbnailFile", performance.now() - time, "ms");
            return getVideoThumbnail(this.file);
        }

        if (/image/.test(this.file.type)) {
            console.log("createThumbnailFile", performance.now() - time, "ms");
            return generateThumbFile(this.file);
        }

        return null;
    }
}
