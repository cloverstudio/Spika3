export function crop(url: string, aspectRatio: number, resizeWidth: number, resizeHeight: number) {
    // we return a Promise that gets resolved with our canvas element
    return new Promise((resolve: (value: Blob) => void) => {
        // this image will hold our source image data
        const inputImage = new Image();

        // we want to wait for our image to load
        inputImage.onload = () => {
            // let's store the width and height of our image
            const inputWidth = inputImage.naturalWidth;
            const inputHeight = inputImage.naturalHeight;

            // get the aspect ratio of the input image
            const inputImageAspectRatio = inputWidth / inputHeight;
            // console.log("Input dim: " + inputImage.naturalWidth + " " + inputImage.naturalHeight);
            // if it's bigger than our target aspect ratio
            let outputWidth = inputWidth;
            let outputHeight = inputHeight;
            if (inputImageAspectRatio > aspectRatio) {
                outputWidth = inputHeight * aspectRatio;
            } else if (inputImageAspectRatio < aspectRatio) {
                outputHeight = inputWidth / aspectRatio;
            }

            // calculate the position to draw the image at
            const outputX = (outputWidth - inputWidth) * 0.5;
            const outputY = (outputHeight - inputHeight) * 0.5;

            // create a canvas that will present the output image
            const croppedImage = document.createElement("canvas");

            // set it to the same size as the image
            croppedImage.width = outputWidth;
            croppedImage.height = outputHeight;
            // draw our image at position 0, 0 on the canvas
            const ctx = croppedImage.getContext("2d");
            ctx.drawImage(inputImage, outputX, outputY);
            // console.log("Crp dim: " + croppedImage.width + " " + croppedImage.height);

            const resizedImage = document.createElement("canvas");
            resizedImage.width = resizeWidth;
            resizedImage.height = resizeHeight;
            const secondContext = resizedImage.getContext("2d");
            secondContext.drawImage(croppedImage, 0, 0, resizeWidth, resizeHeight);
            // console.log("Rsz dim: " + resizedImage.width + " " + resizedImage.height);

            croppedImage.toBlob(function (blob) {
                resolve(blob);
            });
        };

        // start loading our image
        inputImage.src = url;
    });
}
