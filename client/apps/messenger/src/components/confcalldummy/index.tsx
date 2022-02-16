import React, { useEffect, useState, useRef, MutableRefObject, useContext } from "react";
import * as mediasoupClient from "mediasoup-client";
import { Link, useParams } from "react-router-dom";
import SpikaBroadcastClient, {
    Participant,
    getCameras,
    getMicrophones,
} from "./lib/SpikaBroadcastClient";
import { types as mediasoupClientTypes } from "mediasoup-client";
import Utils from "./lib/Utils";
import Peer from "./Peer";
import ScreenShareView from "./ScreenShareView";
import Me from "./Me";
import dayjs from "dayjs";

import SettingModal from "./Modal";
import MicrophoneSelectorModal from "./MicrophoneSelectorModal";
import VideoSelectorModal from "./VideoSelectorModal";
import deviceInfo from "./lib/deviceInfo";
import * as Constants from "./lib/Constants";

import iconCamera from "./assets/img/camera.svg";
import iconMic from "./assets/img/mic.svg";
import iconCameraOff from "./assets/img/cameraoff.svg";
import iconMicOff from "./assets/img/micoff.svg";
import iconExit from "./assets/img/exit.svg";
import iconScreenShare from "./assets/img/screenshare.svg";
import iconScreenShareOff from "./assets/img/screenshareoff.svg";
import iconUsers from "./assets/img/users.svg";
import iconSettingArrow from "./assets/img/settingarrow.svg";
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

    return (
        <div id="spikabroadcast">
            <header></header>
            <main
                className={`conference-main ${
                    screenShareMode || screenShareEnabled ? "screen-share" : "no-screen-share"
                }`}
            >
                <div className={`peers ${peerContainerClass}`}>
                    <div className="me">
                        <Me videoProducer={webcamProcuder} audioProducer={microphoneProducer} />
                        <div
                            className="info"
                            onClick={(e) =>
                                setModalState({ ...modalState, showName: !modalState.showName })
                            }
                        >
                            {displayName}
                        </div>
                    </div>
                    <>
                        {participants
                            ? participants.map((participant, i) => {
                                  return (
                                      <div
                                          className={`participant ${
                                              participant.activeSpeaker ? "active" : ""
                                          }`}
                                          key={participant.id}
                                      >
                                          <Peer participant={participant} key={participant.id} />
                                      </div>
                                  );
                              })
                            : null}
                    </>
                </div>
                <>
                    {participants
                        ? participants.map((participant, i) => {
                              if (
                                  participant.consumers.find((consumer) => {
                                      return consumer.appData.share;
                                  })
                              ) {
                                  const videoTrackConsumer: mediasoupClient.types.Consumer =
                                      participant.consumers.find((consumer) => {
                                          return consumer.appData.share;
                                      });
                                  return (
                                      <div className="screenshare" key={participant.id}>
                                          <ScreenShareView videoTrack={videoTrackConsumer.track} />
                                      </div>
                                  );
                              }
                          })
                        : null}

                    {screenShareEnabled ? (
                        <div className="screenshare">
                            <ScreenShareView videoTrack={screenShareProducer.track} />
                        </div>
                    ) : null}
                </>

                <div className="log">
                    {log.map(({ time, type, message }, index) => {
                        return (
                            <div className={type} key={index}>
                                <span className="date">{time}</span>
                                <span dangerouslySetInnerHTML={{ __html: message }} />
                            </div>
                        );
                    })}
                </div>
                <div className="controlls">
                    <ul>
                        {ready ? (
                            <>
                                <li style={{ width: "67px" }}>
                                    <a
                                        className="large_icon"
                                        onClick={(e) => spikabroadcastClient.toggleCamera()}
                                    >
                                        {cameraEnabled ? (
                                            <img src={iconCamera} />
                                        ) : (
                                            <img src={iconCameraOff} />
                                        )}
                                    </a>
                                </li>
                                <li
                                    className="setting-arrow"
                                    onClick={(e) =>
                                        setModalState({
                                            ...modalState,
                                            showVideo: !modalState.showVideo,
                                        })
                                    }
                                >
                                    <img src={iconSettingArrow} />
                                </li>
                                <li style={{ width: "67px" }}>
                                    <a
                                        className="large_icon"
                                        onClick={(e) => spikabroadcastClient.toggleMicrophone()}
                                    >
                                        {micEnabled ? (
                                            <img src={iconMic} />
                                        ) : (
                                            <img src={iconMicOff} />
                                        )}
                                    </a>
                                </li>
                                <li
                                    className="setting-arrow"
                                    onClick={(e) =>
                                        setModalState({
                                            ...modalState,
                                            showMicrophone: !modalState.showMicrophone,
                                        })
                                    }
                                >
                                    <img src={iconSettingArrow} />
                                </li>
                                <li>
                                    <a className="large_icon">
                                        <img src={iconUsers} />
                                    </a>
                                </li>
                                <li>
                                    <a
                                        className="large_icon"
                                        onClick={(e) => {
                                            if (screenShareMode) {
                                                if (
                                                    confirm(
                                                        "Another use is sharing screen, do you want disable the current share ?"
                                                    )
                                                )
                                                    return spikabroadcastClient.toggleScreenShare();
                                            } else {
                                            }
                                            spikabroadcastClient.toggleScreenShare();
                                        }}
                                    >
                                        {!screenShareEnabled ? (
                                            <img src={iconScreenShare} />
                                        ) : (
                                            <img src={iconScreenShareOff} />
                                        )}
                                    </a>
                                </li>
                            </>
                        ) : null}
                        <li>
                            <a className="button" onClick={(e) => close()}>
                                <img src={iconExit} />
                            </a>
                        </li>
                    </ul>
                </div>
            </main>
            <footer></footer>

            {modalState.showVideo ? (
                <VideoSelectorModal
                    selectedDeviceId={selectedCamera ? selectedCamera.deviceId : ""}
                    onOK={() => {
                        updateDevice(selectedCamera, selectedMicrophone);
                        setModalState({ ...modalState, showVideo: !modalState.showVideo });
                    }}
                    onClose={() =>
                        setModalState({ ...modalState, showVideo: !modalState.showVideo })
                    }
                    onChange={(media: MediaDeviceInfo) => setSelectedCamera(media)}
                />
            ) : null}

            {modalState.showMicrophone ? (
                <MicrophoneSelectorModal
                    selectedDeviceId={selectedMicrophone ? selectedMicrophone.deviceId : ""}
                    onOK={() => {
                        updateDevice(selectedCamera, selectedMicrophone);
                        setModalState({
                            ...modalState,
                            showMicrophone: !modalState.showMicrophone,
                        });
                    }}
                    onClose={() =>
                        setModalState({ ...modalState, showMicrophone: !modalState.showMicrophone })
                    }
                    onChange={(media: MediaDeviceInfo) => setSelectedMicrophone(media)}
                />
            ) : null}
            {modalState.showName ? (
                <SettingModal
                    title="Set Display Name"
                    onOK={() => {
                        setDisplayName(tmpDisplayName);
                        setModalState({ ...modalState, showName: !modalState.showName });
                    }}
                    onClose={() => setModalState({ ...modalState, showName: !modalState.showName })}
                >
                    <>
                        <input
                            type="text"
                            value={tmpDisplayName}
                            onChange={(e: React.FormEvent<HTMLInputElement>) =>
                                setTmpDisplayName(e.currentTarget.value)
                            }
                        />{" "}
                        :
                    </>
                </SettingModal>
            ) : null}
        </div>
    );
}

export default Conference;
