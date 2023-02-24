import CryptoJS from "crypto-js";

addEventListener("message", async (event) => {
    const { file } = event.data;

    postMessage({ hash: await createFileHash(file) });
});

async function createFileHash(file: File) {
    const GB = 1024 * 1024 * 1024;
    const time = performance.now();

    const buffers = await readFileAsArrayBuffer(file);
    console.log("chunks", performance.now() - time);
    if (file.size > GB) {
        const SHA256 = CryptoJS.algo.SHA256.create();

        for (const buffer of buffers) {
            SHA256.update(CryptoJS.lib.WordArray.create(buffer as any));
        }

        const hash = SHA256.finalize().toString();

        console.log("big hash time", performance.now() - time);
        return hash;
    } else {
        const buffer = concatenateArrayBuffers(buffers);

        const hash = hexString(await crypto.subtle.digest("SHA-256", buffer));

        console.log("small hash time", performance.now() - time);
        return hash;
    }
}

function hexString(buffer: ArrayBuffer): string {
    return Array.prototype.map
        .call(new Uint8Array(buffer), (x) => ("00" + x.toString(16)).slice(-2))
        .join("");
}

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer[]> {
    return new Promise((resolve, reject) => {
        const chunkSize = Math.ceil(file.size / 100);
        const totalChunks = Math.ceil(file.size / chunkSize);
        const chunks = new Array(totalChunks);

        let currentChunk = 0;

        const reader = new FileReader();

        reader.onload = function (event) {
            if (event.target && event.target.result) {
                chunks[currentChunk] = event.target.result;
                currentChunk++;

                if (currentChunk < totalChunks) {
                    readNextChunk();
                } else {
                    resolve(chunks);
                }
            }
        };

        reader.onerror = function () {
            reject(reader.error);
        };

        function readNextChunk() {
            const start = currentChunk * chunkSize;
            const end = Math.min(start + chunkSize, file.size);
            const slice = file.slice(start, end);
            reader.readAsArrayBuffer(slice);
        }

        readNextChunk();
    });
}

function concatenateArrayBuffers(arrayBuffers: ArrayBuffer[]): ArrayBuffer {
    const totalByteLength = arrayBuffers.reduce((acc, buf) => acc + buf.byteLength, 0);
    const result = new Uint8Array(totalByteLength);
    let offset = 0;
    for (const buf of arrayBuffers) {
        result.set(new Uint8Array(buf), offset);
        offset += buf.byteLength;
    }
    return result.buffer;
}

export {};
