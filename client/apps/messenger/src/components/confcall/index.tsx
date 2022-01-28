import React, { useEffect, useState, useRef, MutableRefObject, useContext } from "react";
import * as mediasoupClient from "mediasoup-client";
import { Link, useHistory, useParams } from "react-router-dom";
import SpikaBroadcastClient, {
    Participant,
    getCameras,
    getMicrophones,
} from "./lib/SpikaBroadcastClient";
import { types as mediasoupClientTypes } from "mediasoup-client";
import Utils from "./lib/Utils";
import deviceInfo from "./lib/deviceInfo";
import * as Constants from "./lib/Constants";
import { constants } from "buffer";
import { BinaryOperatorToken } from "typescript";
import { propsToClassKey } from "@mui/styles";

declare var CONFCALL_HOST: string;
declare var CONFCALL_PORT: number;

interface ModalState {
    showVideo: boolean;
    showMicrophone: boolean;
    showName: boolean;
}

function Conference({ onClose }: { onClose: Function }) {
    let history = useHistory();

    const myVideoElm: MutableRefObject<HTMLVideoElement | null> = useRef<HTMLVideoElement>(null);

    const [participants, setParticipants] = useState<Array<Participant>>(null);
    const [consumerRefs, setConsumerRefs] = useState([]);
    const [cameraEnabled, setCameraEnabled] = useState<boolean>(
        localStorage.getItem(Constants.LSKEY_MUTECAM) === "0" ? false : true
    );
    const [screenShareEnabled, setScreenShareEnabled] = useState<boolean>(false);
    ("");
    const [micEnabled, setMicEnabled] = useState<boolean>(
        localStorage.getItem(Constants.LSKEY_MUTEMIC) === "0" ? false : true
    );
    const [spikabroadcastClient, setSpikabroadcastClient] = useState<SpikaBroadcastClient>(null);
    const [webcamProcuder, setWebcamProducer] = useState<mediasoupClient.types.Producer>(null);
    const [microphoneProducer, setMicrophoneProducer] =
        useState<mediasoupClient.types.Producer>(null);
    const [screenShareProducer, setScreenshareProducer] =
        useState<mediasoupClient.types.Producer>(null);
    const [log, setLog] = useState<Array<any>>([]);
    const [peerContainerClass, setPeerContainerClass] = useState<string>("type1");
    const [screenShareMode, setScreenShareMode] = useState<boolean>(false);
    let { roomId }: { roomId?: string } = useParams();
    const [openSettings, setOpenSettings] = useState<boolean>(false);

    const [selectedCamera, setSelectedCamera] = useState<MediaDeviceInfo>(null);
    const [selectedMicrophone, setSelectedMicrophone] = useState<MediaDeviceInfo>(null);
    const [displayName, setDisplayName] = useState<string>(
        localStorage.getItem(Constants.LSKEY_USERNAME) || "No name"
    );
    const [tmpDisplayName, setTmpDisplayName] = useState<string>(
        localStorage.getItem(Constants.LSKEY_USERNAME) || "No name"
    );
    const [editNameEnabled, setEditNameEnabled] = useState<boolean>(false);
    const [modalState, setModalState] = useState<ModalState>({
        showVideo: false,
        showMicrophone: false,
        showName: false,
    });

    const [ready, setReady] = useState<boolean>(false);

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
                    onLogging: (type, message) => {},
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
    }, [displayName]);

    const consumerVideoElmInit = (elm: HTMLVideoElement, i: number) => {
        if (!participants || !participants[i] || !elm) return;

        const participant: Participant = participants[i];

        const consumers = participant.consumers;
        if (!consumers) return;

        const stream = new MediaStream();
        consumers.map((consumer) => stream.addTrack(consumer.track));

        elm.srcObject = stream;
        elm.play().catch((error: Error) => console.log(error));
    };

    const close = async () => {
        await spikabroadcastClient.disconnect();
        if (onClose) onClose();
    };

    const updateDevice = async (camera: MediaDeviceInfo, mic: MediaDeviceInfo) => {
        if (camera) {
            console.log("update camera", camera);
            await spikabroadcastClient.updateCamera(camera);
            localStorage.setItem(Constants.LSKEY_SELECTEDCAM, camera.deviceId);
        }

        if (mic) {
            await spikabroadcastClient.updateMicrophone(mic);
            localStorage.setItem(Constants.LSKEY_SELECTEDMIC, mic.deviceId);
        }
    };

    return <>source code comes here</>;
}

export default Conference;
