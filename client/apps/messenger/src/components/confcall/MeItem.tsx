import * as mediasoupClient from "mediasoup-client";
import React, { useEffect, useState, useRef, MutableRefObject } from "react";
import { Box, SxProps } from "@mui/material";
import { Videocam, VideocamOff, Mic, MicOff } from "@mui/icons-material";

import { NAME_COLORS } from "./lib/Constants";

export interface ComponentInterface {
    videoTrack: MediaStreamTrack;
    sx?: SxProps;
    videoEnabled: boolean;
    name: string;
    audioEnabled: boolean;
}

export default ({ videoTrack, sx, videoEnabled, name, audioEnabled }: ComponentInterface) => {
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
                    transform: "rotateY(180deg);",
                    zIndex: 110,
                }}
                component="video"
                ref={videoElm}
                autoPlay
                playsInline
                controls={false}
            />
            {!videoEnabled ? (
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
                        zIndex: 120,
                        textTransform: "uppercase",
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
                {videoEnabled ? (
                    <Videocam sx={stateIconStyles} />
                ) : (
                    <VideocamOff sx={stateIconStyles} />
                )}

                {audioEnabled ? <Mic sx={stateIconStyles} /> : <MicOff sx={stateIconStyles} />}
            </Box>
        </Box>
    );
};
