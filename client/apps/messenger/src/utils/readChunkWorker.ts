import { encode as encodeToBase64 } from "./base64";

addEventListener("message", async (event) => {
    const { file, chunkSize, i } = event.data;

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

    postMessage({ chunk, start });
});
