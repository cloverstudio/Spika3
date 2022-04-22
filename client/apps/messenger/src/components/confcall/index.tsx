import React, { useEffect, useState } from "react";
import { Box, Stack, IconButton, Grid, GridSize, SxProps } from "@mui/material";
import {
    Videocam,
    VideocamOff,
    Mic,
    MicOff,
    Groups,
    Monitor,
    Close,
    KeyboardArrowUp,
} from "@mui/icons-material";
import * as Constants from "../../../../../lib/constants";
import SpikaBroadcastClient, {
    Participant,
    getCameras,
    getMicrophones,
} from "./lib/SpikaBroadcastClient";
import MeItem from "./MeItem";
import ParticipantItem from "./ParticipantItem";
import * as mediasoupClient from "mediasoup-client";
import { useParams } from "react-router-dom";
import Utils from "./lib/Utils";
import dayjs from "dayjs";
import { CallMember, CallParticipant } from "./CallMember";
import ScreenShareView from "./ScreenShareView";

declare var CONFCALL_HOST_URL: string;

interface ModalState {
    showVideo: boolean;
    showMicrophone: boolean;
    showName: boolean;
}

interface ConferenceCallProps {
    roomId: string;
    userId: string;
    userName: string;
    onClose: Function;
}

export default ({ roomId, userId, userName, onClose }: ConferenceCallProps) => {
    const [participants, setParticipants] = useState<Array<Participant>>(null);

    const [cameraEnabled, setCameraEnabled] = useState<boolean>(
        localStorage.getItem(Constants.LSKEY_MUTECAM) === "0" ? false : true
    );
    const [micEnabled, setMicEnabled] = useState<boolean>(
        localStorage.getItem(Constants.LSKEY_MUTEMIC) === "0" ? false : true
    );

    const [selectedCamera, setSelectedCamera] = useState<MediaDeviceInfo>(null);
    const [selectedMicrophone, setSelectedMicrophone] = useState<MediaDeviceInfo>(null);
    const [myVideTrack, setMyVideoTrack] = useState<MediaStreamTrack>(null);
    const [videoLayoutStyle, setVieoLayoutStyle] = useState<SxProps>({});

    useEffect(() => {
        // load cameara and microphones
        (async () => {
            let defaultCamera: MediaDeviceInfo = null;
            let defaultMicrophone: MediaDeviceInfo = null;

            const cameras = await getCameras();
            if (cameras && cameras.length > 0) {
                const selectedCameraDeviceId: string = localStorage.getItem(
                    Constants.LSKEY_SELECTEDCAM
                );
                if (selectedCameraDeviceId) {
                    const camera: MediaDeviceInfo = cameras.find(
                        (c) => c.deviceId === selectedCameraDeviceId
                    );
                    defaultCamera = camera;
                    setSelectedCamera(camera);
                } else {
                    defaultCamera = cameras[0];
                    setSelectedCamera(cameras[0]);
                }
            }

            const microphones = await getMicrophones();
            if (microphones && microphones.length > 0) {
                const selectedMicrophoneDeviceId: string = localStorage.getItem(
                    Constants.LSKEY_SELECTEDMIC
                );
                if (selectedMicrophoneDeviceId) {
                    const microphone: MediaDeviceInfo = microphones.find(
                        (m) => m.deviceId === selectedMicrophoneDeviceId
                    );
                    defaultMicrophone = microphone;
                    setSelectedMicrophone(microphone);
                } else {
                    defaultMicrophone = microphones[0];
                    setSelectedMicrophone(microphones[0]);
                }
            }

            const spikaBroadcastClientLocal = new SpikaBroadcastClient({
                debug: true,
                hostUrl: CONFCALL_HOST_URL,
                roomId: roomId,
                peerId: Utils.randomStr(8),
                displayName: localStorage.getItem(Constants.LSKEY_USERNAME) || "No name",
                avatarUrl: "",
                defaultCamera: defaultCamera,
                defaultMicrophone: defaultMicrophone,
                enableCamera: cameraEnabled,
                enableMicrophone: micEnabled,
                listener: {
                    onStartVideo: (producer) => {
                        setMyVideoTrack(producer.track);
                    },
                    onStartAudio: (producer) => {},
                    onParticipantUpdate: (participantsMap) => {
                        const participantsAry: Array<Participant> = Array.from(
                            participantsMap,
                            ([key, val]) => val
                        );
                        console.log("onParticipantUpdate: " + participantsAry);
                        setParticipants(participantsAry);
                    },
                    onMicrophoneStateChanged: (state) => {},
                    onCameraStateChanged: (state) => {},
                    onScreenShareStateChanged: (state) => {},
                    onStartShare: (producer) => {},
                    onSpeakerStateChanged: () => {},
                    onCallClosed: () => {},
                    onUpdateCameraDevice: () => {},
                    onUpdateMicrophoneDevice: () => {},
                    onUpdateSpeakerDevice: () => {},
                    onLogging: (type, message) => {},
                    onJoined: () => {},
                },
            });

            spikaBroadcastClientLocal.connect();
        })();
    }, []);

    useEffect(() => {
        if (!participants) return;

        if (participants.length == 0) {
            setVieoLayoutStyle({
                display: "block",
            });
        } else if (participants.length < 2)
            setVieoLayoutStyle({
                display: "grid",
                gridTemplateRows: "48vh",
                gridTemplateColumns: "48vw 48vw",
                justifyItems: "center",
                justifyContent: "center",
                alignContent: "center",
                gridGap: "20px",
            });
        else if (participants.length < 4)
            setVieoLayoutStyle({
                display: "grid",
                gridTemplateRows: "48vh 48vh",
                gridTemplateColumns: "48vw 48vw",
                justifyItems: "center",
                justifyContent: "center",
                alignContent: "center",
                gridGap: "20px",
            });
        else if (participants.length < 6)
            setVieoLayoutStyle({
                display: "grid",
                gridTemplateRows: "48vh 48vh",
                gridTemplateColumns: "30vw 30vw 30vw",
                justifyItems: "center",
                justifyContent: "center",
                alignContent: "center",
                gridGap: "20px",
            });
        else
            setVieoLayoutStyle({
                display: "grid",
                gridAutoRow: "18vh",
                gridTemplateColumns: "18vw 18vw 18vw 18vw 18vw",
                justifyItems: "start",
                justifyContent: "center",
                alignContent: "start",
                gridGap: "20px",
            });
    }, [participants]);

    const ControllsBox = (props: any) => {
        return (
            <Box
                sx={{
                    textAlign: "center",
                    color: "#fff",
                    fontSize: "48pt",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100px",
                }}
            >
                {props.children}
            </Box>
        );
    };

    return (
        <Box
            sx={{
                position: "absolute",
                width: "100%",
                height: "100%",
                top: 0,
                left: 0,
                backgroundColor: "#373737",
                border: "none",
            }}
        >
            {/* videos */}
            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: 100,
                    ...videoLayoutStyle,
                }}
            >
                {!participants || participants.length == 0 ? (
                    <MeItem videoTrack={myVideTrack} />
                ) : (
                    <>
                        <MeItem sx={{}} videoTrack={myVideTrack} />
                        {participants.map((participant, index) => {
                            const videoConsumer: mediasoupClient.types.Consumer =
                                participant.consumers.find(
                                    (consumer) => consumer?.track.kind === "video"
                                );

                            let sx: SxProps = {};

                            if (participants.length == 2 && index == 1)
                                sx = { gridColumn: "1 / span 2", width: "48vw" };
                            if (videoConsumer)
                                return <ParticipantItem sx={sx} videoTrack={videoConsumer.track} />;
                        })}
                    </>
                )}
            </Box>

            {/* controls */}
            <Box
                sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: "100px",
                    background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 100%);",
                    zIndex: 110,
                    display: "grid",
                    gridTemplateRows: "1fr",
                    gridTemplateColumns: "auto auto auto auto auto",
                    justifyItems: "center",
                    justifyContent: "center",
                    alignContent: "start",
                    transition: "all 0.5s ease",
                    cursor: "pointer",
                    opacity: "0",
                    "&:hover": {
                        opacity: "1.0",
                    },
                }}
            >
                <ControllsBox>
                    <Videocam sx={{ fontSize: 40 }} />
                    <KeyboardArrowUp />
                </ControllsBox>
                <ControllsBox>
                    <Mic sx={{ fontSize: 40 }} />
                    <KeyboardArrowUp />
                </ControllsBox>
                <ControllsBox>
                    <Groups sx={{ fontSize: 40 }} />
                </ControllsBox>
                <ControllsBox>
                    <Monitor sx={{ fontSize: 40 }} />
                </ControllsBox>
                <ControllsBox>
                    <Close sx={{ fontSize: 40 }} />
                </ControllsBox>
            </Box>
        </Box>
    );
};
