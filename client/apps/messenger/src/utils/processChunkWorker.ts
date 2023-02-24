import { encode as encodeToBase64 } from "./base64";

addEventListener("message", async (event) => {
    const { slice, i, offset } = event.data;
    console.log("start with slice");

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

    postMessage({ chunk, i, offset });
});
