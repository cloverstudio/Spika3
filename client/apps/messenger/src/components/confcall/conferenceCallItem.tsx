import React, { useEffect, useState, useRef, MutableRefObject } from "react";
import { Box, Typography, Stack, IconButton, Tooltip } from "@mui/material";
import { Videocam, VideocamOff, Mic, MicOff } from "@mui/icons-material";
import * as mediasoupClient from "mediasoup-client";
import hark from "hark";
import { CallMember } from "./CallMember";

interface Props {
    participant: CallMember;
    myVideo: mediasoupClient.types.Producer;
    myAudio: mediasoupClient.types.Producer;
    oneParticipant: boolean;
}

export default ({ participant, myVideo, myAudio, oneParticipant }: Props) => {
    const videoElm: MutableRefObject<HTMLVideoElement | null> = useRef<HTMLVideoElement>(null);
    const audioElm: MutableRefObject<HTMLAudioElement | null> = useRef<HTMLAudioElement>(null);

    const [videoResolutionHeight, setVideoResolutionHegith] = useState<number>(0);
    const [videoResolutionWidth, setVideoResolutionWidth] = useState<number>(0);
    const [videoResolutionTimer, setVideoResolutionTimer] = useState<NodeJS.Timeout>(null);
    const [audioMute, setAudioMute] = useState<boolean>(participant?.muteAudio);
    const [videoMute, setVideoMute] = useState<boolean>(participant?.muteAudio);

    const cornerRadius = oneParticipant ? "0" : "1em";

    useEffect(() => {
        if (participant?.audioTrack != null || myAudio != null) {
            // console.log("AudioTrack: " + participant?.audioTrack);
            // console.log("MyAudio: " + myAudio);
            // console.log("MuteAudio: " + participant?.muteAudio);
            const stream = new MediaStream();
            if (participant?.isMe) {
                if (myAudio != null) {
                    if (myAudio.track != null) {
                        stream.addTrack(myAudio.track);
                        audioElm.current.srcObject = stream;

                        audioElm.current.play().catch((error) => console.error(error));

                        if (!stream.getAudioTracks()[0]) return;
                        const _hark = hark(stream, { play: false });

                        _stopVideoResolution();

                        // eslint-disable-next-line no-unused-vars
                        _hark.on("volume_change", (dBs: number, threshold: number) => {
                            let audioVolume = Math.round(Math.pow(10, dBs / 85) * 10);

                            /*
                    if (audioVolume === 1) audioVolume = 0;
            
                    if (audioVolume !== this.state.audioVolume)
                      this.setState({ audioVolume });
                    */
                        });
                    }
                }
            } else {
                if (participant?.audioTrack != null) {
                    stream.addTrack(participant?.audioTrack);
                    audioElm.current.srcObject = stream;
                    audioElm.current.play().catch((error) => console.error(error));

                    if (!stream.getAudioTracks()[0]) return;
                    const _hark = hark(stream, { play: false });

                    _stopVideoResolution();

                    // eslint-disable-next-line no-unused-vars
                    _hark.on("volume_change", (dBs: number, threshold: number) => {
                        let audioVolume = Math.round(Math.pow(10, dBs / 85) * 10);

                        /*
                if (audioVolume === 1) audioVolume = 0;
        
                if (audioVolume !== this.state.audioVolume)
                  this.setState({ audioVolume });
                */
                    });
                }
            }
        } else {
            audioElm.current.srcObject = null;
        }
    }, [participant, myAudio]);

    useEffect(() => {
        // console.log("VideoTrack: " + participant?.videoTrack);
        // console.log("MyVideo: " + myVideo);
        // console.log("MuteVideo: " + participant?.muteVideo);
        if (participant?.videoTrack || myVideo) {
            const stream = new MediaStream();
            // console.log("IsItMe: " + participant?.isMe);
            if (participant?.isMe) {
                if (myVideo != null) {
                    if (myVideo.track != null) {
                        stream.addTrack(myVideo.track);
                    }
                }
            } else {
                if (participant?.videoTrack != null) {
                    stream.addTrack(participant?.videoTrack);
                }
            }
            videoElm.current.srcObject = stream;
            videoElm.current.oncanplay = () => {};
            videoElm.current.onplay = () => {
                audioElm && audioElm.current && audioElm.current.play().catch((error) => {});
            };

            videoElm.current.onpause = () => {};
            // console.log("video notnull:");
            var playPromise = videoElm.current.play();

            if (playPromise !== undefined) {
                playPromise
                    .then((_) => {
                        // Automatic playback started!
                        // Show playing UI.
                        // We can now safely pause video...
                        // videoElm.current.pause();
                    })
                    .catch((error) => {
                        console.error("videoElem.play() failed:%o", error);
                    });
            }
            // videoElm.current
            //     .play()
            //     .catch((error) => console.error("videoElem.play() failed:%o", error));

            _startVideoResolution();
        } else {
            videoElm.current.srcObject = null;
            // console.log("video null: ");
        }
    }, [participant, myVideo]);

    const _startVideoResolution = () => {
        const videoResolutionPeriodicTimer = setInterval(() => {
            if (!videoElm || !videoElm.current) return;

            if (
                videoElm.current.videoWidth !== videoResolutionWidth ||
                videoElm.current.videoHeight !== videoResolutionHeight
            ) {
                setVideoResolutionHegith(videoElm.current.videoHeight);
                setVideoResolutionWidth(videoElm.current.videoWidth);
            }
        }, 500);

        setVideoResolutionTimer(videoResolutionPeriodicTimer);
    };

    const _stopVideoResolution = () => {
        if (!videoResolutionTimer) return;

        clearInterval(videoResolutionTimer);

        setVideoResolutionHegith(0);
        setVideoResolutionWidth(0);
    };

    const handleCamera = () => {
        setVideoMute(!videoMute);
    };
    const handleMic = () => {
        setAudioMute(!audioMute);
    };

    return (
        <Box
            sx={{
                width: "100%",
                height: "100%",
                backgroundColor: "black",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                margin: "0px",
            }}
        >
            {videoElm ? (
                <video
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        borderRadius: cornerRadius,
                    }}
                    ref={videoElm}
                    autoPlay
                    playsInline
                    controls={false}
                    muted={participant?.muteVideo}
                />
            ) : (
                <video autoPlay playsInline controls={false} muted={participant?.muteVideo} />
            )}

            <audio
                ref={audioElm}
                autoPlay
                playsInline
                controls={false}
                muted={participant?.muteAudio}
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    borderRadius: cornerRadius,
                }}
            />
            {!participant?.isMe && false ? <div className="consumer-info"></div> : null}
            {/* <Typography color="white">{participant?.displayName}</Typography> */}
            {!oneParticipant ? (
                <Box
                    sx={{
                        bottom: 0,
                        left: 0,
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        display: "block",
                    }}
                    // className="overlay"
                >
                    <Box
                        sx={{
                            width: "100%",
                            height: "100%",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative",
                        }}
                    >
                        <Box
                            sx={{
                                bottom: 0,
                                position: "absolute",
                                width: "60%",
                                height: "10%",
                                backgroundColor: "white",
                                opacity: 0.3,
                                left: "50%",
                                transform: "translate(-50%, 0%)",
                            }}
                        ></Box>
                        <Box
                            sx={{
                                bottom: 0,
                                position: "absolute",
                                width: "60%",
                                height: "10%",
                                alignItems: "center",
                                justifyContent: "center",
                                display: "flex",
                                left: "50%",
                                transform: "translate(-50%, 0%)",
                                zIndex: 10,
                            }}
                        >
                            <Typography color="white">{participant?.displayName}</Typography>
                        </Box>
                        {!participant?.isMe ? (
                            <Box
                                sx={{
                                    bottom: 0,
                                    position: "absolute",
                                    width: "20%",
                                    height: "10%",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    display: "flex",
                                    left: "73%",
                                    transform: "translate(-50%, 0%)",
                                    zIndex: 10,
                                }}
                            >
                                <Stack
                                    direction="row"
                                    alignItems="right"
                                    spacing={1}
                                    sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: "right",
                                    }}
                                >
                                    <Tooltip title="No Video">
                                        {!participant?.muteVideo ? (
                                            <VideocamOff style={{ fill: "white" }} />
                                        ) : (
                                            <Videocam style={{ fill: "white" }} />
                                        )}
                                    </Tooltip>
                                    <Tooltip title="Mute">
                                        {participant?.muteAudio ? (
                                            <MicOff style={{ fill: "white" }} />
                                        ) : (
                                            <Mic style={{ fill: "white" }} />
                                        )}
                                    </Tooltip>
                                </Stack>
                            </Box>
                        ) : (
                            <Box></Box>
                        )}
                    </Box>
                </Box>
            ) : (
                <Box></Box>
            )}
        </Box>
    );
};
