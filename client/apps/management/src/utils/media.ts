export function getImageDimension(file: File): Promise<{ width: number; height: number }> {
    return new Promise<{ width: number; height: number }>((res, rej) => {
        const img: HTMLImageElement = document.createElement("img");
        const objectURL = window.URL.createObjectURL(file);
        img.src = objectURL;
        document.body.appendChild(img);
        img.addEventListener("load", () => {
            const width = img.clientWidth;
            const height = img.clientHeight;
            res({
                width,
                height,
            });
            img.remove();
        });
    });
}
