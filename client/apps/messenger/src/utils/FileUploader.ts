import { dynamicBaseQuery } from "../api/api";
import generateThumbFile from "../features/room/lib/generateThumbFile";
import { getImageDimension, getVideoInfo, getVideoThumbnail } from "./media";

import ReadChunksWorker from "./readChunksWorker?worker";
import HashFileWorker from "./hashFileWorker?worker";

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
        const readChunksWorker = new ReadChunksWorker();

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
                console.error({ e: e.message });
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
        if (onProgress) {
            onProgress(Math.round((this.chunksUploaded / this.totalChunks) * 100));
        }
    }

    hashFile(): Promise<string> {
        const hashFileWorker = new HashFileWorker();

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
        if (/^.*image*$/.test(this.file.type)) {
            return getImageDimension(this.file);
        }

        if (/^.*video*$/.test(this.file.type)) {
            return getVideoInfo(this.file);
        }
    }

    createThumbnailFile() {
        if (/video/.test(this.file.type)) {
            return getVideoThumbnail(this.file);
        }

        if (/image/.test(this.file.type)) {
            return generateThumbFile(this.file);
        }

        return null;
    }
}
