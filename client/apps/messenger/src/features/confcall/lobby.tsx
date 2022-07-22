import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Box, Grid, useMediaQuery, Button, Avatar } from "@mui/material";
import {
    setShowCall,
    setRoomId,
    setCameraEnabled,
    setMicrophoneEnabled,
    setSelectedCamera,
    setSelectedMicrophone,
} from "./slice/callSlice";
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
import { User } from "@prisma/client";

import { Participant } from "../../types/confcall";
import { dynamicBaseQuery } from "../../api/api";
import { RootState } from "../../store/store";
import * as Constants from "../../../../../lib/constants";
import ButtonsHolder from "./buttonsHolder";
import * as Styles from "./lib/styles";
import { useShowSnackBar } from "../../hooks/useModal";
import SelectBoxDialog from "../../components/SelectBoxDialog";
import { getCameras, getMicrophones } from "./lib/utils";
import deviceHandler from "./lib/deviceHandler";
import { callEventPayload } from "../../types/confcall";
import { listen as listenCallEvent } from "./lib/callEventListener";

declare const UPLOADS_BASE_URL: string;

export default function ConfCall() {
    const isCall = /^.+\/call\/.+$/.test(window.location.pathname);
    const isLobby = /^.+\/call\/lobby\/.+$/.test(window.location.pathname);
    const urlState = /^.+\/call\/lobby\/video$/.test(window.location.pathname) ? "video" : "audio";

    const callState = useSelector((state: RootState) => state.call);
    const cameraEnabled = useSelector((state: RootState) => state.call.cameraEnabled);
    const microphoneEnabled = useSelector((state: RootState) => state.call.microphoneEnabled);
    const selectedCamera = useSelector((state: RootState) => state.call.selectedCamera);
    const selectedMicrophone = useSelector((state: RootState) => state.call.selectedMicrophone);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const localAudioRef = useRef<HTMLAudioElement>(null);
    const showSnackbar = useShowSnackBar();

    const roomId = parseInt(useParams().id || "");
    const [showCameraSelectDialog, setShowCameraSelectDialog] = useState<boolean>(false);
    const [cameraList, setCameraList] = useState<Array<MediaDeviceInfo>>(null);

    const [microphoneList, setMicrophoneList] = useState<Array<MediaDeviceInfo>>(null);
    const [showMicrophoneSelectDialog, setShowMicrophoneSelectDialog] = useState<boolean>(false);

    const [participants, setParticipants] = useState<Array<Participant>>(null);

    function updateDevice() {
        console.log("update device", cameraEnabled);
        // init camera
        (async () => {
            try {
                if (cameraEnabled && localVideoRef.current) {
                    const stream = await deviceHandler.getCamera(selectedCamera);
                    localVideoRef.current.srcObject = stream;
                } else if (!cameraEnabled && localVideoRef.current) {
                    localVideoRef.current.srcObject = null;
                }

                if (!cameraEnabled) deviceHandler.closeCamera();
            } catch (e) {
                console.error(e);
                dispatch(setCameraEnabled(false));
                showSnackbar({
                    severity: "error",
                    text: "Failed to find a webcamera.",
                });
            }
        })();
    }

    async function updateParticipants() {
        const res = await dynamicBaseQuery({
            url: `/confcall/participants/${roomId}`,
        });
        setParticipants(res.data);
    }

    // called when component is ready
    useEffect(() => {
        console.log("urlState", urlState);
        (async () => {
            setCameraList(await getCameras());
            setMicrophoneList(await getMicrophones());

            dispatch(setCameraEnabled(urlState === "video"));
            dispatch(setMicrophoneEnabled(true));
        })();

        const clearListner = listenCallEvent(async (data: callEventPayload) => {
            await updateParticipants();
        });

        return () => {
            clearListner();
        };
    }, []);

    // when lobby screen appears
    useEffect(() => {
        (async () => {
            await updateParticipants();
        })();
    }, [isCall]);

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
        localStorage.setItem(Constants.LSKEY_ENABLEMIC, microphoneEnabled ? "1" : "");

        updateDevice();
    }, [cameraEnabled, microphoneEnabled]);

    // when selected device is changed
    useEffect(() => {
        selectedCamera && localStorage.setItem(Constants.LSKEY_SELECTEDCAM, selectedCamera);
        updateDevice();
    }, [selectedCamera]);

    useEffect(() => {
        selectedMicrophone && localStorage.setItem(Constants.LSKEY_SELECTEDMIC, selectedMicrophone);
        updateDevice();
    }, [selectedMicrophone]);

    // when device list is populted
    useEffect(() => {
        if (!isCall || !cameraList || !microphoneList) return;

        const selectedCameraId: string = localStorage.getItem(Constants.LSKEY_SELECTEDCAM);
        const selectedMicrphoneId: string = localStorage.getItem(Constants.LSKEY_SELECTEDMIC);

        selectedCameraId && dispatch(setSelectedCamera(selectedCameraId));
        selectedMicrphoneId && dispatch(setSelectedMicrophone(selectedMicrphoneId));
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
                                        onClick={() => dispatch(setCameraEnabled(!cameraEnabled))}
                                    />
                                ) : (
                                    <VideocamOffIcon
                                        sx={Styles.controlIconDefaultStyle}
                                        onClick={() => dispatch(setCameraEnabled(!cameraEnabled))}
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
                                {microphoneEnabled ? (
                                    <MicIcon
                                        sx={Styles.controlIconDefaultStyle}
                                        onClick={() =>
                                            dispatch(setMicrophoneEnabled(!microphoneEnabled))
                                        }
                                    />
                                ) : (
                                    <MicOffIcon
                                        sx={Styles.controlIconDefaultStyle}
                                        onClick={() =>
                                            dispatch(setMicrophoneEnabled(!microphoneEnabled))
                                        }
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
                        flexDirection: "column",
                        alignItems: "right",
                        justifyContent: "center",
                    }}
                >
                    <Box
                        sx={{
                            color: "common.confCallControls",
                            display: "flex",
                            flexDirection: "row",
                            marginBottom: "10px",
                            padding: "0px 0px 0px 15px",
                        }}
                    >
                        {participants &&
                            participants.map((participant) => {
                                return (
                                    <Avatar
                                        key={participant.user.id}
                                        sx={{ width: 50, height: 50 }}
                                        alt={participant.user.displayName}
                                        src={`${UPLOADS_BASE_URL}${participant.user.avatarUrl}`}
                                    />
                                );
                            })}
                        {participants && participants.length === 0 && (
                            <span>No one is in the call yet.</span>
                        )}
                    </Box>
                    <Box sx={{ color: "common.confCallControls", padding: "0px 0px 0px 15px" }}>
                        Join to the meeting
                        <br />
                        <Button
                            variant="contained"
                            sx={{ width: "100%", marginTop: "10px" }}
                            onClick={() => {
                                deviceHandler.closeAllDevices();
                                navigate(`/rooms/${roomId}/call`, { replace: true });
                            }}
                        >
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

                    dispatch(setCameraEnabled(false));
                    dispatch(setMicrophoneEnabled(false));

                    dispatch(setShowCall(false));
                    navigate(`/rooms/${callState.roomId}`);
                }}
            />

            <SelectBoxDialog
                show={showCameraSelectDialog}
                title="Select Camera"
                initialValue={selectedCamera}
                allowButtonLabel="OK"
                denyButtonLabel="Cancel"
                onOk={async (deviceId: string) => {
                    dispatch(setSelectedCamera(deviceId));
                    setShowCameraSelectDialog(false);
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
                initialValue={selectedMicrophone}
                allowButtonLabel="OK"
                denyButtonLabel="Cancel"
                onOk={async (deviceId: string) => {
                    dispatch(setSelectedMicrophone(deviceId));
                    setShowMicrophoneSelectDialog(false);
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
