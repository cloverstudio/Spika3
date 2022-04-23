import React, { useEffect, useState } from "react";
import { Box, Select, MenuItem, SxProps } from "@mui/material";
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
import dayjs from "dayjs";
import * as mediasoupClient from "mediasoup-client";
import { useParams } from "react-router-dom";

import * as Constants from "../../../../../lib/constants";
import SpikaBroadcastClient, {
    Participant,
    getCameras,
    getMicrophones,
} from "./lib/SpikaBroadcastClient";
import MeItem from "./MeItem";
import ParticipantItem from "./ParticipantItem";
import ScreenShareItem from "./ScreenShareItem";
import Utils from "./lib/Utils";
import SelectBoxDialog from "../SelectBoxDialog";

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
    const [showCameraSelectDialog, setShowCameraSelectDialog] = useState<boolean>(false);
    const [showMicSelectDialog, setShowMicSelectDialog] = useState<boolean>(false);
    const [participants, setParticipants] = useState<Array<Participant>>(null);
    const [cameraEnabled, setCameraEnabled] = useState<boolean>(
        localStorage.getItem(Constants.LSKEY_MUTECAM) === "0" ? false : true
    );
    const [micEnabled, setMicEnabled] = useState<boolean>(
        localStorage.getItem(Constants.LSKEY_MUTEMIC) === "0" ? false : true
    );
    const [screenShareEnabled, setScreenshareEnabled] = useState<boolean>(false);

    const [spikabroadcastClient, setSpikabroadcastClient] = useState<SpikaBroadcastClient>(null);
    const [selectedCamera, setSelectedCamera] = useState<MediaDeviceInfo>(null);
    const [selectedMicrophone, setSelectedMicrophone] = useState<MediaDeviceInfo>(null);
    const [myVideTrack, setMyVideoTrack] = useState<MediaStreamTrack>(null);
    const [videoLayoutStyle, setVieoLayoutStyle] = useState<SxProps>({});
    const [microphones, setMicrophones] = useState<Array<MediaDeviceInfo>>([]);
    const [cameras, setCameras] = useState<Array<MediaDeviceInfo>>([]);
    const [screenShareVideoTrack, setScreenShareVideoTrack] = useState<MediaStreamTrack>(null);
    const [screenShareMode, setScreenShareMode] = useState<boolean>(false);

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
                setCameras(cameras);
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
                }
                setMicrophones(microphones);
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
                        setParticipants(participantsAry);
                    },
                    onMicrophoneStateChanged: (state) => {
                        setMicEnabled(state);
                    },
                    onCameraStateChanged: (state) => {
                        setCameraEnabled(state);
                    },
                    onScreenShareStateChanged: (state) => {
                        setScreenshareEnabled(state);
                    },
                    onStartShare: (producer) => {
                        setScreenShareVideoTrack(producer.track);
                        setScreenShareMode(true);
                    },
                    onSpeakerStateChanged: () => {},
                    onCallClosed: () => {
                        onClose();
                    },
                    onUpdateCameraDevice: () => {},
                    onUpdateMicrophoneDevice: () => {},
                    onUpdateSpeakerDevice: () => {},
                    onLogging: (type, message) => {},
                    onJoined: () => {},
                },
            });

            spikaBroadcastClientLocal.connect();
            setSpikabroadcastClient(spikaBroadcastClientLocal);
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

        //screenshare handling

        // handle screenshare logic, when another user enables
        if (!screenShareEnabled) {
            const screenShareparticipant: Participant | undefined = participants.find(
                (participant) => participant.consumers.find((consumer) => consumer.appData.share)
            );

            if (screenShareparticipant) {
                const videoTrackConsumer: mediasoupClient.types.Consumer =
                    screenShareparticipant.consumers.find((consumer) => consumer.appData.share);
                if (videoTrackConsumer) setScreenShareVideoTrack(videoTrackConsumer.track);
            }

            const newScreenShareMode = screenShareparticipant !== undefined;
            setScreenShareMode(newScreenShareMode);
        }
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

    const controlIconDefaultStyle: SxProps = {
        "&:hover": {
            backgroundColor: "#fff1",
        },
        padding: "10px",
        fontSize: 40,
        width: "60px",
        height: "60px",
        cursor: "pointer",
    };

    const controlArrowIconDefaultStyle: SxProps = {
        "&:hover": {
            backgroundColor: "#fff1",
        },
        fontSize: 24,
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

            {screenShareMode ? (
                <Box
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        zIndex: 100,
                        display: "grid",
                        gridTemplateRows: "100vh",
                        gridTemplateColumns: "80vw 20vw",
                        justifyItems: "start",
                        justifyContent: "start",
                        alignContent: "start",
                    }}
                >
                    <Box>
                        <ScreenShareItem videoTrack={screenShareVideoTrack} />
                    </Box>
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "20vw",
                            gridAutoRows: "11.25vw",
                            justifyItems: "start",
                            justifyContent: "start",
                            alignContent: "start",
                        }}
                    >
                        {" "}
                        <MeItem sx={{ border: "none" }} videoTrack={myVideTrack} />
                        {participants.map((participant, index) => {
                            const videoConsumer: mediasoupClient.types.Consumer =
                                participant.consumers.find(
                                    (consumer) => consumer?.track.kind === "video"
                                );
                            const audioConsumer: mediasoupClient.types.Consumer =
                                participant.consumers.find(
                                    (consumer) => consumer?.track.kind === "audio"
                                );

                            let sx: SxProps = { border: "none" };

                            return (
                                <ParticipantItem
                                    sx={sx}
                                    videoTrack={videoConsumer?.track}
                                    audioTrack={audioConsumer?.track}
                                />
                            );
                        })}
                    </Box>
                </Box>
            ) : (
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
                                const audioConsumer: mediasoupClient.types.Consumer =
                                    participant.consumers.find(
                                        (consumer) => consumer?.track.kind === "audio"
                                    );

                                let sx: SxProps = {};

                                if (participants.length == 2 && index == 1)
                                    sx = { gridColumn: "1 / span 2", width: "48vw" };

                                return (
                                    <ParticipantItem
                                        sx={sx}
                                        videoTrack={videoConsumer?.track}
                                        audioTrack={audioConsumer?.track}
                                    />
                                );
                            })}
                        </>
                    )}
                </Box>
            )}

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
                    opacity: "0",
                    "&:hover": {
                        opacity: "1.0",
                    },
                }}
            >
                <ControllsBox>
                    {cameraEnabled ? (
                        <Videocam
                            sx={controlIconDefaultStyle}
                            onClick={() => {
                                spikabroadcastClient.toggleCamera();
                            }}
                        />
                    ) : (
                        <VideocamOff
                            sx={controlIconDefaultStyle}
                            onClick={() => {
                                spikabroadcastClient.toggleCamera();
                            }}
                        />
                    )}
                    <KeyboardArrowUp
                        sx={controlArrowIconDefaultStyle}
                        onClick={() => {
                            setShowCameraSelectDialog(true);
                        }}
                    />
                </ControllsBox>
                <ControllsBox>
                    {micEnabled ? (
                        <Mic
                            sx={controlIconDefaultStyle}
                            onClick={() => {
                                spikabroadcastClient.toggleMicrophone();
                            }}
                        />
                    ) : (
                        <MicOff
                            sx={controlIconDefaultStyle}
                            onClick={() => {
                                spikabroadcastClient.toggleMicrophone();
                            }}
                        />
                    )}
                    <KeyboardArrowUp
                        sx={controlArrowIconDefaultStyle}
                        onClick={() => {
                            setShowMicSelectDialog(true);
                        }}
                    />
                </ControllsBox>
                <ControllsBox>
                    <Monitor
                        sx={{
                            ...controlIconDefaultStyle,
                            color: screenShareEnabled ? "#900" : "#fff",
                        }}
                        onClick={async () => {
                            await spikabroadcastClient.toggleScreenShare();
                        }}
                    />
                </ControllsBox>
                <ControllsBox>
                    <Close
                        sx={{ ...controlIconDefaultStyle, color: "#900" }}
                        onClick={async () => {
                            await spikabroadcastClient.disconnect();
                            myVideTrack.stop();
                        }}
                    />
                </ControllsBox>
            </Box>

            <SelectBoxDialog
                show={showCameraSelectDialog}
                title="Select Camera"
                allowButtonLabel="OK"
                denyButtonLabel="Cancel"
                onOk={async (deviceId: string) => {
                    const camera: MediaDeviceInfo = cameras.find(
                        (cam) => cam.deviceId === deviceId
                    );
                    console.log("find camera", camera);
                    await spikabroadcastClient.updateCamera(camera);
                    setShowCameraSelectDialog(false);
                }}
                onCancel={() => {
                    setShowCameraSelectDialog(false);
                }}
                items={cameras.reduce((deviceMap, device) => {
                    deviceMap.set(device.deviceId, device.label);
                    return deviceMap;
                }, new Map<string, string>())}
            ></SelectBoxDialog>

            <SelectBoxDialog
                show={showMicSelectDialog}
                title="Select microphone"
                allowButtonLabel="OK"
                denyButtonLabel="Cancel"
                onOk={async (deviceId: string) => {
                    const mic: MediaDeviceInfo = microphones.find(
                        (mic) => mic.deviceId === deviceId
                    );
                    console.log("find mic", mic);
                    await spikabroadcastClient.updateMicrophone(mic);
                    setShowMicSelectDialog(false);
                }}
                onCancel={() => {
                    setShowMicSelectDialog(false);
                }}
                items={microphones.reduce((deviceMap, device) => {
                    deviceMap.set(device.deviceId, device.label);
                    return deviceMap;
                }, new Map<string, string>())}
            ></SelectBoxDialog>
        </Box>
    );
};
