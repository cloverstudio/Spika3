export function crop(url: string, aspectRatio: number, resizeWidth: number, resizeHeight: number) {
    return new Promise((resolve: (value: Blob) => void) => {
        const inputImage = new Image();

        inputImage.onload = () => {
            const inputWidth = inputImage.naturalWidth;
            const inputHeight = inputImage.naturalHeight;

            const inputImageAspectRatio = inputWidth / inputHeight;

            let outputWidth = inputWidth;
            let outputHeight = inputHeight;
            if (inputImageAspectRatio > aspectRatio) {
                outputWidth = inputHeight * aspectRatio;
            } else if (inputImageAspectRatio < aspectRatio) {
                outputHeight = inputWidth / aspectRatio;
            }

            const outputX = (outputWidth - inputWidth) * 0.5;
            const outputY = (outputHeight - inputHeight) * 0.5;

            const croppedImage = document.createElement("canvas");

            croppedImage.width = outputWidth;
            croppedImage.height = outputHeight;
            const ctx = croppedImage.getContext("2d");
            ctx.drawImage(inputImage, outputX, outputY);

            const resizedImage = document.createElement("canvas");
            resizedImage.width = resizeWidth;
            resizedImage.height = resizeHeight;
            const secondContext = resizedImage.getContext("2d");
            secondContext.drawImage(croppedImage, 0, 0, resizeWidth, resizeHeight);

            resizedImage.toBlob(function (blob) {
                resolve(blob);
            });
        };

        inputImage.src = url;
    });
}
