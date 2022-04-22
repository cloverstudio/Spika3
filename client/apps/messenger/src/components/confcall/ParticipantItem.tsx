import * as mediasoupClient from "mediasoup-client";
import React, { useEffect, useState, useRef, MutableRefObject } from "react";
import { Box, SxProps } from "@mui/material";
import hark from "hark";

export interface ComponentInterface {
    videoTrack: MediaStreamTrack;
    audioTrack: MediaStreamTrack;
    sx?: SxProps;
}

export default ({ videoTrack, audioTrack, sx }: ComponentInterface) => {
    const videoElm: MutableRefObject<HTMLVideoElement | null> = useRef<HTMLVideoElement>(null);
    const audioElm: MutableRefObject<HTMLAudioElement | null> = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (audioTrack) {
            const stream = new MediaStream();
            stream.addTrack(audioTrack);
            audioElm.current.srcObject = stream;

            audioElm.current.play().catch((error) => console.error(error));

            if (!stream.getAudioTracks()[0]) return;

            const _hark = hark(stream, { play: false });

            // eslint-disable-next-line no-unused-vars
            _hark.on("volume_change", (dBs: number, threshold: number) => {
                let audioVolume = Math.round(Math.pow(10, dBs / 85) * 10);
            });
        } else {
            audioElm.current.srcObject = null;
        }
    }, [audioTrack]);

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
                border: "1px solid #fff",
                borderRadius: "2px",
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
        >
            <audio ref={audioElm} autoPlay playsInline controls={false} />
        </Box>
    );
};
