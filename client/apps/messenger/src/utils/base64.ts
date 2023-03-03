const lookup = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
    .split("")
    .map((c) => c.charCodeAt(0));

export const encode = (arraybuffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(arraybuffer);
    const len = bytes.length;
    const result = new Uint8Array(Math.ceil(len / 3) * 4);

    let dst = 0;

    for (let i = 0; i < len; i += 3) {
        const b1 = bytes[i];
        const b2 = bytes[i + 1] || 0;
        const b3 = bytes[i + 2] || 0;
        const idx1 = b1 >> 2;
        const idx2 = ((b1 & 3) << 4) | (b2 >> 4);
        const idx3 = ((b2 & 15) << 2) | (b3 >> 6);
        const idx4 = b3 & 63;
        result[dst++] = lookup[idx1];
        result[dst++] = lookup[idx2];
        result[dst++] = lookup[idx3];
        result[dst++] = lookup[idx4];
    }

    if (len % 3 === 2) {
        result[dst - 1] = 61;
    } else if (len % 3 === 1) {
        result[dst - 1] = 61;
        result[dst - 2] = 61;
    }

    let base64 = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < result.length; i += chunkSize) {
        const chunk = result.subarray(i, i + chunkSize);
        base64 += String.fromCharCode.apply(null, chunk);
    }

    return base64;
};

export const decode = (base64: string): ArrayBuffer => {
    let bufferLength = base64.length * 0.75;
    const len = base64.length;
    let p = 0;
    let encoded1;
    let encoded2;
    let encoded3;
    let encoded4;

    if (base64[base64.length - 1] === "=") {
        bufferLength--;
        if (base64[base64.length - 2] === "=") {
            bufferLength--;
        }
    }

    const arraybuffer = new ArrayBuffer(bufferLength),
        bytes = new Uint8Array(arraybuffer);

    for (let i = 0; i < len; i += 4) {
        encoded1 = lookup[base64.charCodeAt(i)];
        encoded2 = lookup[base64.charCodeAt(i + 1)];
        encoded3 = lookup[base64.charCodeAt(i + 2)];
        encoded4 = lookup[base64.charCodeAt(i + 3)];

        bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
        bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
        bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }

    return arraybuffer;
};
