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

import { useGetUserQuery } from "../auth/api/auth";
import { RootState } from "../../store/store";
import { Participant } from "../../types/confcall";
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
import mediasoupHander, { StreamingState } from "./lib/mediasoupHanlder";

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
    const { data: userDataMe } = useGetUserQuery();

    const [joinApi] = useJoinMutation();
    const [leaveApi] = useLeaveMutation();

    const streamingState = mediasoupHander.useConnectionStatus();

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
    const [participants, setParticipants] = useState<Array<Participant>>(null);
    const [showControllBar, setShowControllBar] = useState<boolean>(false);
    const [viewSize, setViewSize] = useState<participantViewSize>({ xs: 12, md: 12 });
    const [gridStyle, setGridStyle] = useState<CSS.Properties>({});

    const [myVideoStream, setMyVideoStream] = useState<MediaStream>(null);
    const [myAudioAtream, setMyAudioStream] = useState<MediaStream>(null);

    const urlRoomId = parseInt(useParams().id || "");

    async function updateParticipants() {
        const res = await dynamicBaseQuery({
            url: `/confcall/participants/${roomId}`,
        });

        console.log("update participant", res.data);

        setParticipants(res.data);
    }

    // called when component is ready
    useEffect(() => {
        if (roomId === 0) {
            // back to lobby if roomID is not in the state
            navigate(`/rooms/${urlRoomId}/call/lobby/video`);
            return;
        }

        (async () => {
            setCameraList(await getCameras());
            setMicrophoneList(await getMicrophones());

            await joinApi({
                roomId: callState.roomId,
                data: {
                    videoEnabled: cameraEnabled ? "1" : "0",
                    audioEnabled: microphoneEnabled ? "1" : "0",
                },
            });
            await mediasoupHander.connectToServer(callState.roomId);
            await mediasoupHander.startProduce(callState);
            await updateParticipants();
        })();

        const clearListner = listenCallEvent(async (data: callEventPayload) => {
            try {
                await updateParticipants();
            } catch (e) {
                //This happens when component doesn't exists but this listener is called
                //It happens often when user leave the room. I ignore this because its annoying.
            }
        });

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

    // mediasoup events
    mediasoupHander.onCameraReady((stream: MediaStream) => {
        setMyVideoStream(stream);
    });

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
                margin: 0,
                padding: 0,
            }}
            onMouseMove={() => {
                if (showControllbarTimer) clearTimeout(showControllbarTimer);
                setShowControllBar(true);
                showControllbarTimer = setTimeout(() => {
                    setShowControllBar(false);
                }, 300);
            }}
        >
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
                    zIndex: 700,
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
                            mediasoupHander.stop();
                            await leaveApi(callState.roomId);
                            navigate(`/rooms/${callState.roomId}`);
                        }}
                    />
                </ButtonsHolder>
                <ButtonsHolder>
                    {streamingState === StreamingState.NotJoined && "Not Joined"}
                    {streamingState === StreamingState.Joind && "Joined"}
                    {streamingState === StreamingState.AudioReady && "Audio Ready"}
                    {streamingState === StreamingState.VideoReady && "Video Ready"}
                    {streamingState === StreamingState.StartStreaming && "Streamin started"}
                    {streamingState === StreamingState.WaitingConsumer && "Waiting participants"}
                    {streamingState === StreamingState.Established && "Established"}
                    {streamingState === StreamingState.Error && "Error"}
                </ButtonsHolder>
            </Box>

            {/* main part */}
            <Grid container>
                {participants &&
                    participants.map((participant, index) => (
                        <Grid item {...viewSize} sx={gridStyle} key={index}>
                            {participant.user.id === userDataMe.user.id ? (
                                <ParticipantView
                                    user={participant.user}
                                    isMe={true}
                                    localVideoStream={myVideoStream}
                                />
                            ) : (
                                <ParticipantView
                                    user={participant.user}
                                    callParams={participant.callParams}
                                    isMe={false}
                                />
                            )}
                        </Grid>
                    ))}
            </Grid>

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
