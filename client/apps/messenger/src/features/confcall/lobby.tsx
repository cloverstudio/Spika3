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
import SelectBoxDialog from "../../components/SelectBoxDialog";
import { getCameras, getMicrophones } from "./lib/Utils";
import deviceHandler from "./lib/deviceHandler";

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
    const urlState = /^.+\/call\/lobby\/video$/.test(window.location.pathname) ? "video" : "audio";

    const roomId = parseInt(useParams().id || "");
    const [cameraEnabled, setCameraEnabled] = useState<boolean>(urlState === "video");
    const [micEnabled, setMicEnabled] = useState<boolean>(true);
    const [showCameraSelectDialog, setShowCameraSelectDialog] = useState<boolean>(false);
    const [cameraList, setCameraList] = useState<Array<MediaDeviceInfo>>(null);
    const [selectedCamera, setSelectedCamera] = useState<MediaDeviceInfo>(null);

    const [microphoneList, setMicrophoneList] = useState<Array<MediaDeviceInfo>>(null);
    const [showMicrophoneSelectDialog, setShowMicrophoneSelectDialog] = useState<boolean>(false);
    const [selectedMicrophone, setSelectedMicrophone] = useState<MediaDeviceInfo>(null);

    function updateDevice() {
        // init camera
        (async () => {
            try {
                if (cameraEnabled && localVideoRef.current) {
                    const stream = await deviceHandler.getCamera(selectedCamera);
                    localVideoRef.current.srcObject = stream;
                } else if (!cameraEnabled && localVideoRef.current)
                    localVideoRef.current.srcObject = null;

                if (!cameraEnabled) deviceHandler.closeCamera();
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
                    const stream = await deviceHandler.getMicrophone(selectedMicrophone);
                    localAudioRef.current.srcObject = stream;
                } else if (!micEnabled && localAudioRef.current)
                    localAudioRef.current.srcObject = null;

                if (!micEnabled) deviceHandler.closeMicrophone();
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

    // called when component is ready
    useEffect(() => {
        (async () => {
            setCameraList(await getCameras());
            setMicrophoneList(await getMicrophones());
        })();
    }, []);

    // when DOM is ready to play video
    useEffect(() => {
        // reset view only when isCall is changed to true
        if (isCall) {
            dispatch(setRoomId(roomId));
            dispatch(setShowCall(true));

            updateDevice();
        }
    }, [isCall, localVideoRef.current, localAudioRef.current]);

    // when mute state is changed
    useEffect(() => {
        localStorage.setItem(Constants.LSKEY_ENABLECAM, cameraEnabled ? "1" : "");
        localStorage.setItem(Constants.LSKEY_ENABLEMIC, micEnabled ? "1" : "");

        updateDevice();
    }, [cameraEnabled, micEnabled]);

    // when selected device is changed
    useEffect(() => {
        selectedCamera &&
            localStorage.setItem(Constants.LSKEY_SELECTEDCAM, selectedCamera?.deviceId);
        selectedMicrophone &&
            localStorage.setItem(Constants.LSKEY_SELECTEDMIC, selectedMicrophone?.deviceId);

        updateDevice();
    }, [selectedCamera, selectedMicrophone]);

    // when device list is populted
    useEffect(() => {
        if (!isCall || !cameraList || !microphoneList) return;

        const selectedCameraId: string = localStorage.getItem(Constants.LSKEY_SELECTEDCAM);
        const selectedMicrphoneId: string = localStorage.getItem(Constants.LSKEY_SELECTEDMIC);

        selectedCameraId &&
            setSelectedCamera(cameraList.find((cam) => cam.deviceId === selectedCameraId));

        selectedMicrphoneId &&
            setSelectedMicrophone(
                microphoneList.find((mic) => mic.deviceId === selectedMicrphoneId)
            );
    }, [isCall, cameraList, microphoneList]);

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
                zIndex: 500,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
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
                                <KeyboardArrowUpIcon
                                    sx={Styles.controlArrowIconDefaultStyle}
                                    onClick={() => {
                                        setShowCameraSelectDialog(true);
                                    }}
                                />
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
                                <KeyboardArrowUpIcon
                                    sx={Styles.controlArrowIconDefaultStyle}
                                    onClick={() => setShowMicrophoneSelectDialog(true)}
                                />
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
                    deviceHandler.closeAllDevices();
                    localAudioRef.current.srcObject = null;
                    localVideoRef.current.srcObject = null;

                    dispatch(setShowCall(false));
                    navigate(`/rooms/${callState.roomId}`);
                }}
            />

            <SelectBoxDialog
                show={showCameraSelectDialog}
                title="Select Camera"
                initialValue={selectedCamera?.deviceId}
                allowButtonLabel="OK"
                denyButtonLabel="Cancel"
                onOk={async (deviceId: string) => {
                    const camera: MediaDeviceInfo = cameraList.find(
                        (cam) => cam.deviceId === deviceId
                    );
                    setSelectedCamera(camera);
                    setShowCameraSelectDialog(false);
                    updateDevice();
                }}
                onCancel={() => {
                    setShowCameraSelectDialog(false);
                }}
                items={
                    cameraList &&
                    cameraList.reduce((deviceMap, device) => {
                        deviceMap.set(device.deviceId, device.label);
                        return deviceMap;
                    }, new Map<string, string>())
                }
            ></SelectBoxDialog>

            <SelectBoxDialog
                show={showMicrophoneSelectDialog}
                title="Select Microphone"
                initialValue={selectedMicrophone?.deviceId}
                allowButtonLabel="OK"
                denyButtonLabel="Cancel"
                onOk={async (deviceId: string) => {
                    const microphone: MediaDeviceInfo = microphoneList.find(
                        (mic) => mic.deviceId === deviceId
                    );

                    setSelectedMicrophone(microphone);
                    setShowMicrophoneSelectDialog(false);
                    updateDevice();
                }}
                onCancel={() => {
                    setShowMicrophoneSelectDialog(false);
                }}
                items={
                    microphoneList &&
                    microphoneList.reduce((deviceMap, device) => {
                        deviceMap.set(device.deviceId, device.label);
                        return deviceMap;
                    }, new Map<string, string>())
                }
            ></SelectBoxDialog>
        </Box>
    );
}
