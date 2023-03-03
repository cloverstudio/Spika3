import { dynamicBaseQuery } from "../api/api";
import generateThumbFile from "../features/room/lib/generateThumbFile";
import { getImageDimension, getVideoInfo, getVideoThumbnail } from "./media";
import CryptoJS from "crypto-js";

import ReadChunkWorker from "./readChunkWorker?worker";
import HashFileWorker from "./hashFileWorker?worker";

type FileUploaderConstructorType = {
    file: File;
    type: string;
    relationId?: number;
    onProgress?: (progress: number) => void;
};

class FileUploader {
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
        this.chunkSize = this.getChunkSize();
        this.totalChunks = Math.ceil(file.size / this.chunkSize);
        this.hashPromise = this.hashFile();
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
        const readChunkWorker = new ReadChunkWorker();

        let readChunks = 0;

        const postMessage = (i) => {
            readChunkWorker.postMessage({
                file: this.file,
                chunkSize: this.chunkSize,
                i,
                encode: true,
            });
        };

        return new Promise((resolve, reject) => {
            let inProgress = 0;
            readChunkWorker.onmessage = async (e) => {
                const { chunk, start } = e.data;

                if (!chunk) {
                    return;
                }

                while (inProgress > 4) {
                    await sleep(350);
                }

                readChunks++;

                postMessage(readChunks);
                inProgress++;
                await onChunk(chunk, start);
                inProgress--;

                if (this.chunksUploaded === this.totalChunks) {
                    readChunkWorker.terminate();
                    resolve();
                }
            };

            readChunkWorker.onerror = (e) => {
                console.error({ e: e.message });
                readChunkWorker.terminate();
                reject(e.message);
            };

            postMessage(readChunks);
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
        const HALF_GB = 512 * 1024 * 1024;

        if (this.file.size < HALF_GB) {
            return this.hashSmallFile();
        }

        return this.hashBigFile();
    }

    hashSmallFile(): Promise<string> {
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

    hashBigFile(): Promise<string> {
        const readChunkWorker = new ReadChunkWorker();
        const SHA256 = CryptoJS.algo.SHA256.create();
        const totalChunks = Math.ceil((this.file.size / this.chunkSize) * 2);

        return new Promise((resolve, reject) => {
            let inProgress = 0;
            let hashedChunks = 0;

            const postMessage = (i: number) => {
                readChunkWorker.postMessage({
                    file: this.file,
                    chunkSize: this.chunkSize * 2,
                    i,
                    encode: false,
                });
            };

            readChunkWorker.onmessage = async (e) => {
                const { chunk } = e.data;

                if (!chunk) {
                    return;
                }

                inProgress++;

                while (inProgress > 4) {
                    await sleep(350);
                }

                postMessage(hashedChunks + 1);
                SHA256.update(CryptoJS.lib.WordArray.create(chunk as any));
                inProgress--;

                hashedChunks++;

                if (hashedChunks === totalChunks) {
                    readChunkWorker.terminate();
                    resolve(SHA256.finalize().toString());
                }
            };

            readChunkWorker.onerror = (e) => {
                console.error({ e: e.message });
                readChunkWorker.terminate();
                reject(e.message);
            };

            postMessage(0);
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
        const ONE_MB = 1024 * 1024;
        const ONE_GB = 1024 * 1024 * 1024;

        if (this.file.size > ONE_GB) {
            return ONE_MB * 2;
        } else {
            return ONE_MB;
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

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export default FileUploader;
