import React, { useEffect, useState, useRef, MutableRefObject } from "react";
import { Participant } from "../../components/confcalldummy/lib/SpikaBroadcastClient";
import { Box, Typography, Stack, IconButton, Tooltip } from "@mui/material";
import { Videocam, VideocamOff, Mic, MicOff } from "@mui/icons-material";
import * as mediasoupClient from "mediasoup-client";
import hark from "hark";
import { CallMember } from "../mocks/CallMember";

interface Props {
    participant: CallMember;
    myVideo: mediasoupClient.types.Producer;
    myAudio: mediasoupClient.types.Producer;
}

export default ({ participant, myVideo, myAudio }: Props) => {
    const videoElm: MutableRefObject<HTMLVideoElement | null> = useRef<HTMLVideoElement>(null);
    const audioElm: MutableRefObject<HTMLAudioElement | null> = useRef<HTMLAudioElement>(null);

    const [videoResolutionHeight, setVideoResolutionHegith] = useState<number>(0);
    const [videoResolutionWidth, setVideoResolutionWidth] = useState<number>(0);
    const [videoResolutionTimer, setVideoResolutionTimer] = useState<NodeJS.Timeout>(null);
    const [audioMute, setAudioMute] = useState<boolean>(participant.muteAudio);
    const [videoMute, setVideoMute] = useState<boolean>(participant.muteAudio);

    useEffect(() => {
        if (participant.audioTrack || myAudio) {
            const stream = new MediaStream();
            stream.addTrack(participant.isMe ? myAudio.track : participant.audioTrack);
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
        } else {
            audioElm.current.srcObject = null;
        }
    }, [participant.audioTrack, myAudio]);

    useEffect(() => {
        console.log("Video track:" + participant.videoTrack);
        console.log("Video track:" + myVideo);
        if (participant.videoTrack || myVideo) {
            const stream = new MediaStream();

            stream.addTrack(participant.isMe ? myVideo.track : participant.videoTrack);
            videoElm.current.srcObject = stream;
            videoElm.current.oncanplay = () => {};
            videoElm.current.onplay = () => {
                audioElm && audioElm.current && audioElm.current.play().catch((error) => {});
            };

            videoElm.current.onpause = () => {};

            videoElm.current
                .play()
                .catch((error) => console.error("videoElem.play() failed:%o", error));

            _startVideoResolution();
        } else {
            videoElm.current.srcObject = null;
        }
    }, [participant.videoTrack, myVideo]);

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
        console.log("ovdje udje");
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
                borderRadius: "1em",
                position: "relative",
                "&:hover .overlay": {
                    display: "block",
                },
                margin: "0px",
            }}
        >
            {videoElm ? (
                <video
                    ref={videoElm}
                    autoPlay
                    playsInline
                    controls={false}
                    muted={participant.muteVideo}
                />
            ) : (
                <video autoPlay playsInline controls={false} muted={participant.muteVideo} />
            )}

            <audio
                ref={audioElm}
                autoPlay
                playsInline
                controls={false}
                muted={participant.muteAudio}
            />
            {!participant.isMe && false ? <div className="consumer-info"></div> : null}
            {/* <Typography color="white">{participant.displayName}</Typography> */}
            <Box
                sx={{
                    bottom: 0,
                    left: 0,
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    display: "none",
                }}
                className="overlay"
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
                        <Typography color="white">{participant.displayName}</Typography>
                    </Box>
                    {/* {participant.isMe ? (
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
                                    <IconButton sx={{ padding: 0 }} onClick={handleCamera}>
                                        {participant.muteVideo ? (
                                            <VideocamOff style={{ fill: "white" }} />
                                        ) : (
                                            <Videocam style={{ fill: "white" }} />
                                        )}
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Mute">
                                    <IconButton sx={{ padding: 0 }} onClick={handleMic}>
                                        {participant.muteAudio ? (
                                            <MicOff style={{ fill: "white" }} />
                                        ) : (
                                            <Mic style={{ fill: "white" }} />
                                        )}
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        </Box>
                    ) : (
                        <Box></Box>
                    )} */}
                </Box>
            </Box>
        </Box>
    );
};
