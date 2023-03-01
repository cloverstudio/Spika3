import { THUMB_WIDTH } from "../../../../lib/constants";

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

export function getVideoInfo(
    file: File
): Promise<{ width: number; height: number; duration: number }> {
    const seekTo = 1.5;

    return new Promise<{ width: number; height: number; duration: number }>((res, rej) => {
        // load the file to a video player
        const videoPlayer = document.createElement("video");
        videoPlayer.setAttribute("src", URL.createObjectURL(file));
        videoPlayer.load();
        videoPlayer.addEventListener("error", (ex) => {
            rej("error when loading video file");
        });
        // load metadata of the video to get video duration and dimensions
        videoPlayer.addEventListener("loadedmetadata", () => {
            // seek to user defined timestamp (in seconds) if possible
            if (videoPlayer.duration < seekTo) {
                rej("video is too short.");
                return;
            }
            // delay seeking or else 'seeked' event won't fire on Safari
            setTimeout(() => {
                videoPlayer.currentTime = seekTo;
            }, 200);
            // extract video thumbnail once seeking is complete
            videoPlayer.addEventListener("seeked", () => {
                res({
                    width: videoPlayer.videoWidth,
                    height: videoPlayer.videoHeight,
                    duration: videoPlayer.duration,
                });
                videoPlayer.remove();
            });
        });
    });
}

export function getVideoThumbnail(file: File): Promise<File> {
    const seekTo = 1.5;

    return new Promise<File>((res, rej) => {
        // load the file to a video player
        const videoPlayer = document.createElement("video");
        videoPlayer.setAttribute("src", URL.createObjectURL(file));
        videoPlayer.load();
        videoPlayer.addEventListener("error", (ex) => {
            rej("error when loading video file");
        });
        // load metadata of the video to get video duration and dimensions
        videoPlayer.addEventListener("loadedmetadata", () => {
            // seek to user defined timestamp (in seconds) if possible
            if (videoPlayer.duration < seekTo) {
                rej("video is too short.");
                return;
            }
            // delay seeking or else 'seeked' event won't fire on Safari
            setTimeout(() => {
                videoPlayer.currentTime = seekTo;
            }, 200);
            // extract video thumbnail once seeking is complete
            videoPlayer.addEventListener("seeked", () => {
                // define a canvas to have the same dimension as the video
                const canvas = document.createElement("canvas");
                canvas.width = THUMB_WIDTH;
                canvas.height = (videoPlayer.videoHeight * THUMB_WIDTH) / videoPlayer.videoWidth;

                // draw the video frame to canvas
                const ctx = canvas.getContext("2d");
                ctx.drawImage(videoPlayer, 0, 0, canvas.width, canvas.height);
                // return the canvas image as a blob
                ctx.canvas.toBlob(
                    (blob) => {
                        const file: File = new File([blob], "videoThumbnail.png");
                        res(file);
                    },
                    "image/png",
                    0.75 /* quality */
                );
                canvas.remove();
                videoPlayer.remove();
            });
        });
    });
}
