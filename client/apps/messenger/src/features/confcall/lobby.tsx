import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Box, Grid, useMediaQuery, Button } from "@mui/material";
import { setShowCall, setRoomId } from "./slice/callSlice";
import { useSelector, useDispatch } from "react-redux";
import {
    Close as CloseIcon,
    Videocam as VideocamIcon,
    VideocamOff as VideocamOffIcon,
    Mic as MicIcon,
    MicOff as MicOffIcon,
    KeyboardArrowUp as KeyboardArrowUpIcon,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

import { RootState } from "../../store/store";
import * as Constants from "../../../../../lib/constants";

import ButtonsHolder from "./ButtonsHolder";
import * as Styles from "./lib/styles";
import { useShowSnackBar } from "../../hooks/useModal";

export default function ConfCall() {
    const callState = useSelector((state: RootState) => state.call);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const localAudioRef = useRef<HTMLAudioElement>(null);
    const showSnackbar = useShowSnackBar();

    const isCall = /^.+\/call\/.+$/.test(window.location.pathname);
    const isLobby = /^.+\/call\/lobby\/.+$/.test(window.location.pathname);
    const roomId = parseInt(useParams().id || "");
    const [cameraEnabled, setCameraEnabled] = useState<boolean>(
        !!localStorage.getItem(Constants.LSKEY_ENABLECAM)
    );
    const [micEnabled, setMicEnabled] = useState<boolean>(
        !!localStorage.getItem(Constants.LSKEY_ENABLEMIC)
    );

    function updateDevice() {
        // init camera
        (async () => {
            try {
                if (cameraEnabled && localVideoRef.current) {
                    const videoStream: MediaStream = await navigator.mediaDevices.getUserMedia({
                        audio: false,
                        video: cameraEnabled,
                    });

                    localVideoRef.current.srcObject = videoStream;
                } else if (!cameraEnabled && localVideoRef.current)
                    localVideoRef.current.srcObject = null;
            } catch (e) {
                console.error(e);
                setCameraEnabled(false);
                showSnackbar({
                    severity: "error",
                    text: "Failed to find a webcamera.",
                });
            }

            try {
                if (micEnabled && localAudioRef.current) {
                    const audioStream: MediaStream = await navigator.mediaDevices.getUserMedia({
                        audio: micEnabled,
                        video: false,
                    });

                    localAudioRef.current.srcObject = audioStream;
                } else if (!micEnabled && localAudioRef.current)
                    localAudioRef.current.srcObject = null;
            } catch (e) {
                console.error(e);
                setMicEnabled(false);
                showSnackbar({
                    severity: "error",
                    text: "Failed to find a microphone.",
                });
            }
        })();
    }

    useEffect(() => {
        // reset view only when isCall is changed to true
        if (isCall) {
            dispatch(setRoomId(roomId));
            dispatch(setShowCall(true));

            updateDevice();
        }
    }, [isCall]);

    useEffect(() => {
        localStorage.setItem(Constants.LSKEY_ENABLECAM, cameraEnabled ? "1" : "");
        localStorage.setItem(Constants.LSKEY_ENABLEMIC, micEnabled ? "1" : "");

        updateDevice();
    }, [cameraEnabled, micEnabled]);

    if (!callState.showCall) return null;

    return (
        <Box
            sx={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "common.confCallBackground",
                border: "none",
                zIndex: 1400,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <CloseIcon
                sx={{
                    position: "absolute",
                    top: 15,
                    right: 15,
                    cursor: "pointer",
                    color: "common.confCallControls",
                }}
                fontSize="large"
                onClick={() => {
                    dispatch(setShowCall(false));
                    navigate(`/rooms/${callState.roomId}`);
                }}
            />

            <Grid
                container
                sx={{
                    width: isMobile ? "100vw" : "80vw",
                    height: isMobile ? "100vh" : "80vh",
                }}
            >
                <Grid item xs={12} md={8} sx={{}}>
                    <Box
                        sx={{
                            display: "flex",
                            height: "100%",
                            flexDirection: "column",
                        }}
                    >
                        <Box
                            sx={{
                                height: "calc(100% - 100px)",
                            }}
                        >
                            <video
                                autoPlay
                                ref={localVideoRef}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                }}
                            />
                            <audio
                                autoPlay
                                ref={localAudioRef}
                                style={
                                    {
                                        //display: "hidden",
                                    }
                                }
                            />
                        </Box>
                        <Box
                            sx={{
                                height: "100px",
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "center",
                            }}
                        >
                            <ButtonsHolder>
                                {cameraEnabled ? (
                                    <VideocamIcon
                                        sx={Styles.controlIconDefaultStyle}
                                        onClick={() => setCameraEnabled(!cameraEnabled)}
                                    />
                                ) : (
                                    <VideocamOffIcon
                                        sx={Styles.controlIconDefaultStyle}
                                        onClick={() => setCameraEnabled(!cameraEnabled)}
                                    />
                                )}
                                <KeyboardArrowUpIcon sx={Styles.controlArrowIconDefaultStyle} />
                            </ButtonsHolder>
                            <ButtonsHolder>
                                {micEnabled ? (
                                    <MicIcon
                                        sx={Styles.controlIconDefaultStyle}
                                        onClick={() => setMicEnabled(!micEnabled)}
                                    />
                                ) : (
                                    <MicOffIcon
                                        sx={Styles.controlIconDefaultStyle}
                                        onClick={() => setMicEnabled(!micEnabled)}
                                    />
                                )}
                                <KeyboardArrowUpIcon sx={Styles.controlArrowIconDefaultStyle} />
                            </ButtonsHolder>
                        </Box>
                    </Box>
                </Grid>
                <Grid
                    item
                    xs={12}
                    md={4}
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <Box sx={{ color: "common.confCallControls", padding: "0px 0px 0px 15px" }}>
                        Join to the meeting
                        <br />
                        <Button variant="contained" sx={{ width: "100%", marginTop: "10px" }}>
                            Join
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}
