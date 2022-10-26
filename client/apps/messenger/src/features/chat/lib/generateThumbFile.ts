import { THUMB_WIDTH } from "../../../../../../lib/constants";

export default function generateThumbFile(
    originalFile: File,
    canvas: HTMLCanvasElement
): Promise<File | null> {
    return new Promise((res) => {
        try {
            if (!canvas) {
                return res(null);
            }

            const ctx = canvas.getContext("2d");
            canvas.width = THUMB_WIDTH;
            const img = new Image();

            img.onload = function () {
                canvas.height = (img.height * THUMB_WIDTH) / img.width;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.toBlob(
                    async (blob) => {
                        const thumbFile = new File([blob], "thumb - " + originalFile.name, {
                            type: "image/jpeg",
                        });

                        res(thumbFile);
                    },
                    "image/jpeg",
                    1
                );
            };

            img.src = URL.createObjectURL(originalFile);
        } catch (error) {
            console.error("Thumb creation failed: ", error);
            res(null);
        }
    });
}
