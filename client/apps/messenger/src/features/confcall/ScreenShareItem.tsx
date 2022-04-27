import * as mediasoupClient from "mediasoup-client";
import React, { useEffect, useState, useRef, MutableRefObject } from "react";
import { Box, SxProps } from "@mui/material";

export interface ComponentInterface {
    videoTrack: MediaStreamTrack;
    sx?: SxProps;
}

export default ({ videoTrack, sx }: ComponentInterface) => {
    const videoElm: MutableRefObject<HTMLVideoElement | null> = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoTrack) {
            const stream = new MediaStream();

            stream.addTrack(videoTrack);
            videoElm.current.srcObject = stream;

            videoElm.current.onpause = () => {};

            videoElm.current
                .play()
                .catch((error) => console.error("videoElem.play() failed:%o", error));
        } else {
            videoElm.current.srcObject = null;
        }
    }, [videoTrack]);

    return (
        <Box
            sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                ...sx,
            }}
            component="video"
            ref={videoElm}
            autoPlay
            playsInline
            controls={false}
        />
    );
};
