import React, { useEffect, useState, useRef } from "react";
import { Box, Grid, useMediaQuery, Button } from "@mui/material";
import CSS from "csstype";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { useSelector, useDispatch } from "react-redux";
import {
    Close as CloseIcon,
    Videocam as VideocamIcon,
    VideocamOff as VideocamOffIcon,
    Mic as MicIcon,
    MicOff as MicOffIcon,
    KeyboardArrowUp as KeyboardArrowUpIcon,
    ScreenShare as ScreenShareIcon,
    StopScreenShare as StopScreenShareIcon,
} from "@mui/icons-material";

import {
    setShowCall,
    setRoomId,
    setCameraEnabled,
    setMicrophoneEnabled,
    setSelectedCamera,
    setSelectedMicrophone,
    setScreenshareEnabled,
} from "./slice/callSlice";

import { RootState } from "../../store/store";
import UserType from "../../types/User";
import { dynamicBaseQuery } from "../../api/api";
import ButtonsHolder from "./buttonsHolder";
import * as Constants from "../../../../../lib/constants";
import { useShowSnackBar } from "../../hooks/useModal";
import { callEventPayload } from "../../types/confcall";
import { listen as listenCallEvent } from "./lib/callEventListener";
import * as Styles from "./lib/styles";
import SelectBoxDialog from "../../components/SelectBoxDialog";
import { getCameras, getMicrophones } from "./lib/utils";
import ParticipantView from "./participantView";
import mediasoupHander from "./lib/mediasoupHanlder";

//API
import { useJoinMutation, useLeaveMutation } from "./api";

let showControllbarTimer: NodeJS.Timer;

type participantViewSize = {
    xs: number;
    md: number;
};

export default function ConfCall() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const [joinApi] = useJoinMutation();
    const [leaveApi] = useLeaveMutation();

    const roomId = useSelector((state: RootState) => state.call.roomId);
    const cameraEnabled = useSelector((state: RootState) => state.call.cameraEnabled);
    const microphoneEnabled = useSelector((state: RootState) => state.call.microphoneEnabled);
    const screenshareEnabled = useSelector((state: RootState) => state.call.screenshareEnabled);
    const selectedCamera = useSelector((state: RootState) => state.call.selectedCamera);
    const selectedMicrophone = useSelector((state: RootState) => state.call.selectedMicrophone);
    const callState = useSelector((state: RootState) => state.call);

    const [showCameraSelectDialog, setShowCameraSelectDialog] = useState<boolean>(false);
    const [cameraList, setCameraList] = useState<Array<MediaDeviceInfo>>(null);
    const [microphoneList, setMicrophoneList] = useState<Array<MediaDeviceInfo>>(null);
    const [showMicrophoneSelectDialog, setShowMicrophoneSelectDialog] = useState<boolean>(false);
    const [participants, setParticipants] = useState<Array<UserType>>(null);
    const [showControllBar, setShowControllBar] = useState<boolean>(false);
    const [viewSize, setViewSize] = useState<participantViewSize>({ xs: 12, md: 12 });
    const [gridStyle, setGridStyle] = useState<CSS.Properties>({});

    const urlRoomId = parseInt(useParams().id || "");

    async function updateParticipants() {
        const res = await dynamicBaseQuery({
            url: `/confcall/participants/${roomId}`,
        });
        setParticipants(res.data);
    }

    // called when component is ready
    useEffect(() => {
        if (roomId === 0) {
            // back to lobby if roomID is not in the state
            navigate(`/rooms/${urlRoomId}/call/lobby/video`);
        }

        (async () => {
            await joinApi(callState.roomId);
            setCameraList(await getCameras());
            setMicrophoneList(await getMicrophones());
        })();

        const clearListner = listenCallEvent((data: callEventPayload) => {
            updateParticipants();
        });

        updateParticipants();

        return () => {
            clearListner();
        };
    }, []);

    useEffect(() => {
        if (!participants) return;

        const count = participants.length;

        if (count === 1) {
            setViewSize({
                xs: 12,
                md: 12,
            });
            setGridStyle({
                height: isMobile ? "100vh" : "100vh",
            });
        } else if (count === 2) {
            setViewSize({
                xs: 12,
                md: 6,
            });
            setGridStyle({
                height: isMobile ? "50vh" : "100vh",
            });
        } else if (count <= 4) {
            setViewSize({
                xs: 6,
                md: 6,
            });
            setGridStyle({
                height: isMobile ? "50vh" : "50vh",
            });
        } else if (count <= 6) {
            setViewSize({
                xs: 6,
                md: 4,
            });
            setGridStyle({
                height: isMobile ? "50vh" : "50vh",
            });
        } else {
            setViewSize({
                xs: 6,
                md: 3,
            });
            setGridStyle({
                height: isMobile ? "50vh" : "50vh",
            });
        }
    }, [participants]);

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
                overflowY: "auto",
            }}
            onMouseMove={() => {
                if (showControllbarTimer) clearTimeout(showControllbarTimer);
                setShowControllBar(true);
                showControllbarTimer = setTimeout(() => {
                    setShowControllBar(false);
                }, 300);
            }}
        >
            {/* main part */}
            <Grid container>
                {participants &&
                    participants.map((user, index) => (
                        <Grid item {...viewSize} sx={gridStyle}>
                            <ParticipantView key={index} user={user} />
                        </Grid>
                    ))}
            </Grid>

            {/* controller */}
            <Box
                sx={{
                    height: "100px",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    position: "absolute",
                    bottom: 0,
                    width: "100%",
                    background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%);",
                    opacity: showControllBar ? "1" : "0",
                    transition: "all 0.5s ease;",
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
                            onClick={() => dispatch(setMicrophoneEnabled(!microphoneEnabled))}
                        />
                    ) : (
                        <MicOffIcon
                            sx={Styles.controlIconDefaultStyle}
                            onClick={() => dispatch(setMicrophoneEnabled(!microphoneEnabled))}
                        />
                    )}
                    <KeyboardArrowUpIcon
                        sx={Styles.controlArrowIconDefaultStyle}
                        onClick={() => setShowMicrophoneSelectDialog(true)}
                    />
                </ButtonsHolder>
                <ButtonsHolder>
                    {screenshareEnabled ? (
                        <ScreenShareIcon
                            sx={Styles.controlIconDefaultStyle}
                            onClick={() => dispatch(setScreenshareEnabled(!screenshareEnabled))}
                        />
                    ) : (
                        <StopScreenShareIcon
                            sx={Styles.controlIconDefaultStyle}
                            onClick={() => dispatch(setScreenshareEnabled(!screenshareEnabled))}
                        />
                    )}
                </ButtonsHolder>
                <ButtonsHolder>
                    <CloseIcon
                        sx={Styles.controlIconDefaultStyle}
                        onClick={async () => {
                            await leaveApi(callState.roomId);
                            navigate(`/rooms/${callState.roomId}`);
                        }}
                    />
                </ButtonsHolder>
            </Box>

            {/* modals */}
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
