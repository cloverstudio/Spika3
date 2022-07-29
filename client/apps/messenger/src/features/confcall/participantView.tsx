import React, { useEffect, useState, useRef } from "react";
import { Box, Grid, useMediaQuery, Button } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { useSelector, useDispatch } from "react-redux";
import { VillaRounded } from "@mui/icons-material";
import CSS from "csstype";

import UserType from "../../types/User";
import { CallParams } from "../../types/confcall";
import mediasoupHandler from "./lib/mediasoupHanlder";

import {
    setShowCall,
    setRoomId,
    setCameraEnabled,
    setMicrophoneEnabled,
    setSelectedCamera,
    setSelectedMicrophone,
    setScreenshareEnabled,
} from "./slice/callSlice";

export interface ComponentInterface {
    userId: number;
    displayName: string;
    isMe: boolean;
    localVideoStream?: MediaStream;
    localAaudioStream?: MediaStream;
    videoProducerId?: string;
    audioProducerId?: string;
    audioEnabled?: boolean;
    videoEnabled?: boolean;
}

const defaultStyle: CSS.Properties = {
    height: "100%",
    width: "100%",
    border: "1px solid #fff1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "common.confCallFirstLetterColor",
    fontFamily: "'Roboto', sans-serif",
    fontWeight: "bold",
    backgroundColor: "common.videoBackground",
    fontSize: "72px",
    margin: 0,
    padding: 0,
};

const styles: Record<string, CSS.Properties> = {
    container: {
        height: "100%",
        width: "100%",
        border: "1px solid #fff1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "common.confCallFirstLetterColor",
        fontFamily: "'Roboto', sans-serif",
        fontWeight: "bold",
        backgroundColor: "common.videoBackground",
        fontSize: "72px",
        margin: 0,
        padding: 0,
        position: "relative",
    },
    videoContainer: {
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 600,
    },
    video: {
        width: "100%",
        height: "100%",
        padding: "2px",
        objectFit: "cover",
    },
    audio: {
        display: "hidden",
    },
};

let videoStreamLocal: MediaStream = null;
let audioStreamLocal: MediaStream = null;

export default (props: ComponentInterface) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        console.log(`userid ${props.userId} video state changed ${props.videoEnabled}`);
    }, [props.videoEnabled, props.audioEnabled]);

    useEffect(() => {
        if (props.isMe) return;

        (async () => {
            await mediasoupHandler.startConsume(
                {
                    audioProducerId: props.audioProducerId,
                    videoProducerId: props.videoProducerId,
                },
                (audioStream: MediaStream, videoStream: MediaStream) => {
                    if (videoStream) videoStreamLocal = videoStream;
                    if (audioStream) audioStreamLocal = audioStream;
                    updateVideo();
                }
            );
        })();
    }, [props.audioProducerId, props.videoProducerId]);

    useEffect(() => {
        if (!videoRef.current || !props.localVideoStream) return;
        videoRef.current.srcObject = props.localVideoStream;
    }, [videoRef, props.localVideoStream]);

    useEffect(() => {
        updateVideo();
    }, [videoRef, audioRef]);

    const updateVideo = () => {
        if (props.isMe) return;

        if (videoStreamLocal && videoRef.current) videoRef.current.srcObject = videoStreamLocal;
        if (audioStreamLocal && audioRef.current) audioRef.current.srcObject = audioStreamLocal;
    };

    return (
        <Box sx={{ ...styles.container }}>
            {props.displayName.substring(0, 1)}
            <div style={styles.videoContainer}>
                <video
                    autoPlay
                    ref={videoRef}
                    style={{ ...styles.video, opacity: props.videoEnabled ? 1 : 0 }}
                ></video>
                <audio autoPlay ref={audioRef} style={styles.audio}></audio>
            </div>
        </Box>
    );
};
