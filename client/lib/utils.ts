export function wait(sec: number) {
    return new Promise<void>((res, rej) => {
        setTimeout(() => {
            res();
        }, sec * 1000);
    });
}
