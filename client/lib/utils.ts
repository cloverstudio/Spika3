import hash from "crypto-js/sha256";

export function wait(sec: number): Promise<void> {
    return new Promise<void>((res) => {
        setTimeout(() => {
            res();
        }, sec * 1000);
    });
}

export function generateRandomString(length: number): string {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export function sha256(original: string): string {
    return hash(original).toString();
}
