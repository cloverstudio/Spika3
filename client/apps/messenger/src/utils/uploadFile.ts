import CryptoJS from "crypto-js";
import { dynamicBaseQuery } from "../api/api";
import { encode } from "./base64";
import { getImageDimension, getVideoInfo } from "./media";

const chunkSize = 1024 * 54;

export default async function uploadFile({
    file,
    type,
    relationId,
}: {
    file: File;
    type: string;
    relationId?: number;
}): Promise<{ path: string; id: number }> {
    const total = Math.ceil(file.size / chunkSize);

    let lastOffset = 0;
    let chunkOffset = 0;
    let previous: any[] = [];
    let hash: string;
    const clientId = String(Math.round(Math.random() * 100000000));
    let verificationStarted = false;
    let metaData: { duration: number; width: number; height: number } = null;

    return new Promise((resolve, reject) => {
        try {
            const handleChunk = (chunk: string, offset: number) => {
                return dynamicBaseQuery({
                    url: "/upload/files",
                    method: "POST",
                    data: {
                        chunk,
                        offset,
                        clientId,
                    },
                });
            };

            const handleVerify = (hash: string) => {
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
            };

            const SHA256 = CryptoJS.algo.SHA256.create();

            (async () => {
                if (/^.*image.*$/.test(type)) {
                    const dimension = await getImageDimension(file);
                    metaData = { ...metaData, ...dimension };
                }
                if (/^.*video.*$/.test(type)) {
                    const videoInfo = await getVideoInfo(file);
                    metaData = { ...metaData, ...videoInfo };
                }

                loading(
                    file,
                    (data) => {
                        handleChunk(encode(data), chunkOffset)
                            .then((res) => {
                                if (
                                    hash &&
                                    total === res.data.uploadedChunks.length &&
                                    !verificationStarted
                                ) {
                                    verificationStarted = true;
                                    handleVerify(hash)
                                        .then((res) => {
                                            if (res && res.data && res.data.file) {
                                                resolve(res.data.file);
                                            } else {
                                                reject("Upload error");
                                            }

                                            lastOffset = 0;
                                            previous = [];
                                        })
                                        .catch((e) => {
                                            console.log("verification error: ", { e });
                                            reject(e);
                                        });
                                }
                            })
                            .catch((e) => {
                                console.log("upload chunk error: ", { e });
                                reject(e);
                            });

                        SHA256.update(CryptoJS.lib.WordArray.create(data));
                        chunkOffset++;
                    },
                    () => {
                        hash = SHA256.finalize().toString();
                    }
                );
            })();
        } catch (error) {
            console.log("Upload file error: ", error);
            reject(error);
        }
    });

    function loading(file: File, callbackProgress: (data: any) => void, callbackFinal: () => void) {
        let offset = 0;
        let partial;

        if (file.size === 0) {
            callbackFinal();
        }

        while (offset < file.size) {
            partial = file.slice(offset, offset + chunkSize);

            const reader = new FileReader();
            const currentOffset = offset;
            reader.onload = function (evt) {
                callbackRead(this, file, callbackProgress, callbackFinal, {
                    chunkSize,
                    offset: currentOffset,
                });
            };
            reader.readAsArrayBuffer(partial);

            offset += chunkSize;
        }
    }

    function callbackRead(
        reader: FileReader,
        file: File,
        callbackProgress: (data: any) => void,
        callbackFinal: () => void,
        { chunkSize, offset }: { chunkSize: number; offset: number }
    ) {
        if (lastOffset !== offset) {
            // out of order
            console.log("[", chunkSize, "]", offset, "->", offset + chunkSize, ">>buffer");
            previous.push({ offset, size: chunkSize, result: reader.result });
            return;
        }

        function parseResult(offset: number, chunkSize: number, result: string | ArrayBuffer) {
            lastOffset = offset + chunkSize;
            callbackProgress(result);
            if (offset + chunkSize >= file.size) {
                lastOffset = 0;
                callbackFinal();
            }
        }

        // in order
        parseResult(offset, chunkSize, reader.result);

        // resolve previous buffered
        let buffered = [{}];
        while (buffered.length > 0) {
            buffered = previous.filter(function (item) {
                return item.offset === lastOffset;
            });
            buffered.forEach(function (item: any) {
                parseResult(item.offset, item.size, item.result);
                previous = previous.filter((v) => v !== item);
            });
        }
    }
}
