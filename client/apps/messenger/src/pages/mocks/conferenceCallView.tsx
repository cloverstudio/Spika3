import React, { useEffect, useState } from "react";
import { Box, Stack, IconButton, Grid, GridSize } from "@mui/material";
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
import ConferenceCallItem from "../mocks/conferenceCallItem";
import MediaOutputModalView from "./conferenceCallModalView";
import * as Constants from "../../components/confcalldummy/lib/Constants";
import SpikaBroadcastClient, {
    Participant,
    getCameras,
    getMicrophones,
} from "../../components/confcalldummy/lib/SpikaBroadcastClient";
import * as mediasoupClient from "mediasoup-client";
import { useParams } from "react-router-dom";
import Utils from "../../components/confcalldummy/lib/Utils";
import dayjs from "dayjs";
import { CallMember, CallParticipant } from "../mocks/CallMember";

declare var CONFCALL_HOST: string;
declare var CONFCALL_PORT: number;

interface ModalState {
    showVideo: boolean;
    showMicrophone: boolean;
    showName: boolean;
}

function ConferenceCallView() {
    const [open, setOpen] = React.useState(false);
    const [participantCount, setParticipantCount] = React.useState<number>(0);
    const [gridSize, setGridSize] = React.useState<GridSize>(6);
    const [audioDevices, setAudioDevices] = React.useState<MediaDeviceInfo[]>(null);
    const [selectedVideoDevice, setSelectedVideoDevice] = React.useState<MediaDeviceInfo>(null);
    const [selectedAudioDevice, setSelectedAudioDevice] = React.useState<MediaDeviceInfo>(null);
    const [openModal, setOpenModal] = React.useState<boolean>(false);
    const [isItAudio, setIsItAudio] = React.useState<boolean>(false);
    const [mute, setMute] = React.useState<boolean>(false);
    const [cameraOff, setCameraOff] = React.useState<boolean>(false);
    const [screenShare, setScreenShare] = React.useState<boolean>(false);
    const handleCamera = () => {
        spikabroadcastClient.toggleCamera();
        setCameraOff(!cameraOff);
    };
    const chooseVideoOutput = async () => {
        setIsItAudio(false);
        setOpenModal(true);
    };
    const handleMic = () => {
        spikabroadcastClient.toggleMicrophone();
        setMute(!mute);
    };
    const chooseAudioOutput = async () => {
        setIsItAudio(true);
        setOpenModal(true);
    };
    const handleGroup = () => {};
    const handleShare = () => {
        setScreenShare(!screenShare);
    };

    const closeConference = () => {};

    const handleDrawerOpen = () => {
        console.log("click");
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    const convertParticipantToCallMember = (participants: Participant[]) => {
        callMemberArray = [];
        participants.forEach((element) => {
            const audioConsumer = element.consumers.find(
                (consumer) => consumer.track.kind === "audio"
            );
            const videoConsumer = element.consumers.find(
                (consumer) => consumer.track.kind === "video"
            );
            var member: CallParticipant = {
                participant: {
                    isMe: false,
                    displayName: element.displayName,
                    audioTrack: audioConsumer?.track,
                    videoTrack: videoConsumer?.track,
                    muteAudio: false,
                    muteVideo: false,
                },
            };
            callMemberArray.push(member);
        });
        calculateLayoutByParticipantNumber();
    };

    const calculateLayoutByParticipantNumber = () => {
        let numberOfParticipants: number = callMemberArray.length + 1;
        console.log("Number of participants:" + numberOfParticipants);
        var indexForOwnData = 0;
        if (numberOfParticipants > 2 && numberOfParticipants < 5) {
            if (!screenShare) {
                setGridSize(6);
                indexForOwnData = 2;
            }
        }
        if (numberOfParticipants > 4 && numberOfParticipants < 7) {
            if (!screenShare) {
                setGridSize(4);
                indexForOwnData = 3;
            }
        }
        if (numberOfParticipants > 6) {
            if (!screenShare) {
                setGridSize(3);
                let numberOfRows = Math.floor(dataArray.length / 4);
                indexForOwnData = numberOfRows * 4;
            }
        }
        if (screenShare) {
            setGridSize(12);
            indexForOwnData = dataArray.length;
        }

        callMemberArray.splice(indexForOwnData, 0, member);

        setCombinedArray(callMemberArray);
        setParticipantCount(callMemberArray.length);
    };

    useEffect(() => {}, [screenShare]);
    useEffect(() => {}, [gridSize]);

    const [participants, setParticipants] = React.useState<Array<Participant>>(null);
    const [cameraEnabled, setCameraEnabled] = React.useState<boolean>(
        localStorage.getItem(Constants.LSKEY_MUTECAM) === "0" ? false : true
    );
    const [screenShareEnabled, setScreenShareEnabled] = React.useState<boolean>(false);
    ("");
    const [micEnabled, setMicEnabled] = React.useState<boolean>(
        localStorage.getItem(Constants.LSKEY_MUTEMIC) === "0" ? false : true
    );
    const [spikabroadcastClient, setSpikabroadcastClient] =
        React.useState<SpikaBroadcastClient>(null);
    const [webcamProducer, setWebcamProducer] =
        React.useState<mediasoupClient.types.Producer>(null);
    const [microphoneProducer, setMicrophoneProducer] =
        React.useState<mediasoupClient.types.Producer>(null);
    const [screenShareProducer, setScreenshareProducer] =
        React.useState<mediasoupClient.types.Producer>(null);
    const [log, setLog] = React.useState<Array<any>>([]);
    const [peerContainerClass, setPeerContainerClass] = React.useState<string>("type1");
    const [screenShareMode, setScreenShareMode] = React.useState<boolean>(false);
    let { roomId }: { roomId?: string } = useParams();

    const [selectedCamera, setSelectedCamera] = React.useState<MediaDeviceInfo>(null);
    const [selectedMicrophone, setSelectedMicrophone] = React.useState<MediaDeviceInfo>(null);

    var callMemberArray: CallParticipant[] = [];
    var me: CallMember = {
        isMe: true,
        displayName: "vedran",
        audioTrack: microphoneProducer?.track,
        videoTrack: webcamProducer?.track,
        muteAudio: true,
        muteVideo: true,
    };
    var member: CallParticipant = { participant: me };
    const dataArray: CallParticipant[] = [member];
    const [combinedArray, setCombinedArray] = React.useState<CallParticipant[]>(dataArray);
    const [videoDevices, setVideoDevices] = React.useState<MediaDeviceInfo[]>(null);
    const [displayName, setDisplayName] = React.useState<string>(
        localStorage.getItem(Constants.LSKEY_USERNAME) || "No name"
    );
    const [tmpDisplayName, setTmpDisplayName] = React.useState<string>(
        localStorage.getItem(Constants.LSKEY_USERNAME) || "No name"
    );
    const [editNameEnabled, setEditNameEnabled] = React.useState<boolean>(false);
    const [modalState, setModalState] = React.useState<ModalState>({
        showVideo: false,
        showMicrophone: false,
        showName: false,
    });

    const [ready, setReady] = React.useState<boolean>(false);

    const peerId = localStorage.getItem(Constants.LSKEY_PEERID)
        ? localStorage.getItem(Constants.LSKEY_PEERID)
        : Utils.randomStr(8);
    if (!localStorage.getItem(Constants.LSKEY_PEERID))
        localStorage.setItem(Constants.LSKEY_PEERID, peerId);

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
                host: CONFCALL_HOST,
                port: CONFCALL_PORT,
                roomId: "test",
                peerId: Utils.randomStr(8),
                displayName: localStorage.getItem(Constants.LSKEY_USERNAME) || "No name",
                avatarUrl: "",
                defaultCamera: defaultCamera,
                defaultMicrophone: defaultMicrophone,
                enableCamera: cameraEnabled,
                enableMicrophone: micEnabled,
                listener: {
                    onStartVideo: (producer) => {
                        console.log("start video", producer);
                        setWebcamProducer(producer);
                    },
                    onStartAudio: (producer) => {
                        setMicrophoneProducer(producer);
                    },
                    onParticipantUpdate: (participants) => {
                        const participantsAry: Array<Participant> = Array.from(
                            participants,
                            ([key, val]) => val
                        );
                        convertParticipantToCallMember(participantsAry);
                        setParticipants(participantsAry);
                    },
                    onMicrophoneStateChanged: (state) => {
                        localStorage.setItem(Constants.LSKEY_MUTEMIC, state ? "1" : "0");
                        setMicEnabled(state);
                    },
                    onCameraStateChanged: (state) => {
                        localStorage.setItem(Constants.LSKEY_MUTECAM, state ? "1" : "0");
                        setCameraEnabled(state);
                    },
                    onScreenShareStateChanged: (state) => {
                        setScreenShareEnabled(state);
                    },
                    onStartShare: (producer) => {
                        setScreenshareProducer(producer);
                    },
                    onSpeakerStateChanged: () => {},
                    onCallClosed: () => {},
                    onUpdateCameraDevice: () => {},
                    onUpdateMicrophoneDevice: () => {},
                    onUpdateSpeakerDevice: () => {},
                    onLogging: (type, message) => {
                        if (typeof message !== "string")
                            message = `<span class="small">${Utils.printObj(message)}</span>`;
                        log.push({ time: dayjs().format("HH:mm"), type, message });
                    },
                    onJoined: () => {
                        setReady(true);
                    },
                },
            });

            spikaBroadcastClientLocal.connect();
            setSpikabroadcastClient(spikaBroadcastClientLocal);
        })();

        // save roomid
        localStorage.setItem(Constants.LSKEY_LASTROOM, roomId);
    }, []);

    useEffect(() => {
        if (!participants) return;
        // console.log("Number of participants:" + participants.length);
        const participantCount = participants.length;
        if (participantCount <= 1) setPeerContainerClass("type1");
        else if (participantCount <= 3) setPeerContainerClass("type2");
        else if (participantCount <= 5) setPeerContainerClass("type3");
        else setPeerContainerClass("type4");

        // handle screenshare logic
        const screenShareparticipant: Participant | undefined = participants.find((participant) =>
            participant.consumers.find((consumer) => consumer.appData.share)
        );
        const newScreenShareMode = screenShareparticipant !== undefined;

        if (screenShareMode !== newScreenShareMode && newScreenShareMode && screenShareEnabled) {
            console.log("going to disable screenshare");
            spikabroadcastClient.toggleScreenShare();
        }
        setScreenShareMode(newScreenShareMode);
    }, [participants]);

    useEffect(() => {
        if (spikabroadcastClient) spikabroadcastClient.changeDisplayName(displayName);
        setEditNameEnabled(false);
        localStorage.setItem(Constants.LSKEY_USERNAME, displayName);
    }, [displayName, webcamProducer]);

    return (
        <Box sx={{ display: "flex", backgroundColor: "lightgray" }} position="relative">
            {screenShare ? (
                <Stack
                    direction="row"
                    alignItems="right"
                    spacing={1}
                    sx={{ display: "flex", flexDirection: "row", justifyContent: "right" }}
                >
                    <Box width="80vw" height="91vh" my={1} display="flex" justifyContent="center">
                        Screen share
                    </Box>
                    <Box width="20vw" height="91vh" my={1} display="flex" justifyContent="center">
                        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 1, md: 1 }}>
                            {combinedArray.map((row) => (
                                <Grid item xs={gridSize} lg={gridSize} xl={gridSize}>
                                    <ConferenceCallItem
                                        participant={row.participant}
                                        myVideo={row.participant.isMe ? webcamProducer : null}
                                        myAudio={row.participant.isMe ? microphoneProducer : null}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </Stack>
            ) : (
                [
                    combinedArray.length < 3 ? (
                        [
                            combinedArray.length < 2 ? (
                                <Box width="100%" height="91vh" position="relative">
                                    <Box width="100%" height="100%">
                                        <ConferenceCallItem
                                            participant={combinedArray[0].participant}
                                            myVideo={webcamProducer}
                                            myAudio={microphoneProducer}
                                        />
                                    </Box>
                                </Box>
                            ) : (
                                <Box width="100%" height="91vh" position="relative">
                                    <Box width="100%" height="100%">
                                        <ConferenceCallItem
                                            participant={combinedArray[1].participant}
                                            myVideo={null}
                                            myAudio={null}
                                        />
                                    </Box>
                                    <Box
                                        width="30%"
                                        height="30%"
                                        position="absolute"
                                        bottom="0"
                                        left="0"
                                    >
                                        <ConferenceCallItem
                                            participant={combinedArray[0].participant}
                                            myVideo={webcamProducer}
                                            myAudio={microphoneProducer}
                                        />
                                    </Box>
                                </Box>
                            ),
                        ]
                    ) : (
                        <Box
                            width="100%"
                            height="91vh"
                            my={1}
                            display="flex"
                            justifyContent="center"
                        >
                            <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 1, md: 1 }}>
                                {combinedArray.map((row) => (
                                    <Grid item xs={gridSize} lg={gridSize} xl={gridSize}>
                                        <ConferenceCallItem
                                            participant={row.participant}
                                            myVideo={row.participant.isMe ? webcamProducer : null}
                                            myAudio={
                                                row.participant.isMe ? microphoneProducer : null
                                            }
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    ),
                ]
            )}
            <Box
                position="fixed"
                bottom="0"
                left="0"
                height="8vh"
                width="100%"
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",

                    background: "linear-gradient(rgba(255,255,255,.2) 40%, rgba(150,150,150,.8))",
                }}
            >
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    sx={{ display: "flex", flexDirection: "row", justifyContent: "center" }}
                >
                    <Box>
                        <IconButton sx={{ padding: 0 }} onClick={handleCamera}>
                            {cameraOff ? (
                                <VideocamOff style={{ fill: "white" }} />
                            ) : (
                                <Videocam style={{ fill: "white" }} />
                            )}
                        </IconButton>
                        <IconButton sx={{ padding: 0 }} onClick={chooseVideoOutput}>
                            <KeyboardArrowUp fontSize="small" style={{ fill: "white" }} />
                        </IconButton>
                    </Box>
                    <Box>
                        <IconButton sx={{ padding: 0 }} onClick={handleMic}>
                            {mute ? (
                                <MicOff style={{ fill: "white" }} />
                            ) : (
                                <Mic style={{ fill: "white" }} />
                            )}
                        </IconButton>
                        <IconButton sx={{ padding: 0 }} onClick={chooseAudioOutput}>
                            <KeyboardArrowUp fontSize="small" style={{ fill: "white" }} />
                        </IconButton>
                    </Box>
                    <IconButton onClick={handleGroup}>
                        <Groups style={{ fill: "white" }} />
                    </IconButton>
                    <IconButton onClick={handleShare}>
                        <Monitor style={{ fill: "white" }} />
                    </IconButton>
                    <IconButton onClick={closeConference}>
                        <Close style={{ fill: "red" }} />
                    </IconButton>
                </Stack>
            </Box>
            {openModal ? (
                <MediaOutputModalView
                    isItAudio={isItAudio}
                    openModal={openModal}
                    setOpenModal={setOpenModal}
                    selectedAudioOutput={setSelectedAudioDevice}
                    selectedVideoOutput={setSelectedVideoDevice}
                />
            ) : (
                <Box></Box>
            )}
        </Box>
    );
}

export default ConferenceCallView;
