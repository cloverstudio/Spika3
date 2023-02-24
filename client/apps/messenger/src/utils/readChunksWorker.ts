import { encode as encodeToBase64 } from "./base64";

addEventListener("message", (event) => {
    const { file, chunkSize } = event.data;

    readChunks(file, chunkSize, (data) => {
        postMessage(data);
    });
});

async function readChunks(file: File, chunkSize: number, callbackProgress: (data: any) => void) {
    const totalChunks = Math.ceil(file.size / chunkSize);

    for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const slice = file.slice(start, end);

        const result = await new Promise<ArrayBuffer>((resolve) => {
            const reader = new FileReader();
            reader.onload = function (event) {
                if (event.target && event.target.result) {
                    resolve(event.target.result as ArrayBuffer);
                }
            };
            reader.readAsArrayBuffer(slice);
        });

        const chunk = encodeToBase64(result);

        callbackProgress({ chunk, start });
    }
}
