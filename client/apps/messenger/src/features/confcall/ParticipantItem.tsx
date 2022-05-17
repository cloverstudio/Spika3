import * as mediasoupClient from "mediasoup-client";
import React, { useEffect, useState, useRef, MutableRefObject } from "react";
import { Box, SxProps } from "@mui/material";
import hark from "hark";
import { NAME_COLORS } from "./lib/Constants";
import { Videocam, VideocamOff, Mic, MicOff } from "@mui/icons-material";

export interface ComponentInterface {
    videoTrack: MediaStreamTrack;
    audioTrack: MediaStreamTrack;
    sx?: SxProps;
    name: string;
    audioEnabled: boolean;
}

export default ({ videoTrack, audioTrack, sx, name, audioEnabled }: ComponentInterface) => {
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

    const firstLetter = name.charAt(0);
    const letterCode = name.charCodeAt(0);

    const stateIconStyles: SxProps = {
        marginLeft: "10px",
    };
    return (
        <Box
            sx={{
                position: "relative",
                width: "100%",
                height: "100%",
                backgroundColor: "#222",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                ...sx,
            }}
        >
            <Box
                sx={{
                    position: "absolute",
                    left: "0px",
                    top: "0px",
                    border: "1px solid #fff",
                    borderRadius: "2px",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    zIndex: 110,
                }}
                component="video"
                ref={videoElm}
                autoPlay
                playsInline
                controls={false}
            >
                <audio ref={audioElm} autoPlay playsInline controls={false} />
            </Box>
            {!videoTrack ? (
                <Box
                    sx={{
                        fontSize: "40pt",
                        color: "#fff",
                        fontFamily: "'Roboto', sans-serif",
                        fontWeight: "bold",
                        width: "100px",
                        height: "100px",
                        borderRadius: "50px 2px 50px 2px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: NAME_COLORS[letterCode % NAME_COLORS.length],
                        textTransform: "uppercase",
                        zIndex: 120,
                    }}
                >
                    {firstLetter}
                </Box>
            ) : null}
            <Box
                sx={{
                    position: "absolute",
                    left: "0px",
                    bottom: "0px",
                    width: "100%",
                    lineHeight: "30px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#222",
                    textAlign: "center",
                    zIndex: 130,
                    backgroundColor: "#fff9",
                }}
            >
                {name}
                {videoTrack ? (
                    <Videocam sx={stateIconStyles} />
                ) : (
                    <VideocamOff sx={stateIconStyles} />
                )}

                {audioEnabled ? <Mic sx={stateIconStyles} /> : <MicOff sx={stateIconStyles} />}
            </Box>
        </Box>
    );
};