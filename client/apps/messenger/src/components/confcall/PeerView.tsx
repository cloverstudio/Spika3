import * as mediasoupClient from "mediasoup-client";
import React, { useEffect, useState, useRef, MutableRefObject } from "react";
import hark from "hark";
import protooClient, { Peer } from "protoo-client";
import { isMappedTypeNode } from "typescript";

export interface PeerViewInterface {
    isMe: boolean;
    audioTrack?: MediaStreamTrack;
    videoTrack?: MediaStreamTrack;
    muteAudio?: boolean;
    muteVideo?: boolean;
    peer?: Peer;
    audioRtpParameters?: mediasoupClient.types.RtpParameters;
    videoRtpParameters?: mediasoupClient.types.RtpParameters;
    consumerSpatialLayers?: number;
    consumerTemporalLayers?: number;
    consumerCurrentSpatialLayer?: number;
    consumerCurrentTemporalLayer?: number;
    consumerPreferredSpatialLayer?: number;
    consumerPreferredTemporalLayer?: number;
    consumerPriority?: number;
    audioConsumerId?: string;
    videoConsumerId?: string;
    videoMultiLayer?: boolean;
    audioCodec?: string;
    videoCodec?: string;
    videoLayerType?: string;
    displayName?: string;
}

export default ({
    videoTrack,
    audioTrack,
    muteVideo = false,
    muteAudio = false,
    audioRtpParameters,
    videoRtpParameters,
    consumerSpatialLayers,
    consumerTemporalLayers,
    consumerCurrentSpatialLayer,
    consumerCurrentTemporalLayer,
    consumerPreferredSpatialLayer,
    consumerPreferredTemporalLayer,
    consumerPriority,
    audioConsumerId,
    videoConsumerId,
    videoMultiLayer,
    audioCodec,
    videoCodec,
    isMe = false,
    videoLayerType,
    displayName,
}: PeerViewInterface) => {
    const videoElm: MutableRefObject<HTMLVideoElement | null> = useRef<HTMLVideoElement>(null);
    const audioElm: MutableRefObject<HTMLAudioElement | null> = useRef<HTMLAudioElement>(null);

    const [videoResolutionHeight, setVideoResolutionHegith] = useState<number>(0);
    const [videoResolutionWidth, setVideoResolutionWidth] = useState<number>(0);
    const [videoResolutionTimer, setVideoResolutionTimer] = useState<NodeJS.Timeout>(null);

    useEffect(() => {
        if (audioTrack) {
            const stream = new MediaStream();
            stream.addTrack(audioTrack);
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
    }, [audioTrack]);

    useEffect(() => {
        if (videoTrack) {
            const stream = new MediaStream();

            stream.addTrack(videoTrack);
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
    }, [videoTrack]);

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

    return (
        <>
            {isMe ? null : (
                <>
                    <div className="info">{displayName}</div>
                    <div className="info2">
                        {muteAudio ? (
                            <i className="fas fa-microphone-slash" />
                        ) : (
                            <i className="fas fa-microphone" />
                        )}
                        {muteVideo ? (
                            <i className="fas fa-video" />
                        ) : (
                            <i className="fas fa-video-slash" />
                        )}
                    </div>
                </>
            )}
            <span>{displayName ? displayName.substring(0, 1) : ""}</span>
            {videoElm ? (
                <video ref={videoElm} autoPlay playsInline controls={false} muted={muteVideo} />
            ) : (
                <video autoPlay playsInline controls={false} muted={muteVideo} />
            )}

            <audio ref={audioElm} autoPlay playsInline controls={false} muted={muteAudio} />
            {!isMe && false ? (
                <div className="consumer-info">
                    <ul>
                        <li>AudioConsumerId: {audioConsumerId}</li>
                        <li>videoConsumerId: {videoConsumerId}</li>
                        <li>Audio: {audioCodec}</li>
                        <li>VideoCodec: {videoCodec}</li>
                        <li>AudioCodec: {audioCodec}</li>
                        <li>VideoTrack: {videoTrack ? "On" : "Off"}</li>
                        <li>AudioTrack: {audioTrack ? "On" : "Off"}</li>
                        <li>VideoLayerType: {videoLayerType}</li>
                        <li>videoMultiLayer: {videoMultiLayer ? "yes" : "no"}</li>
                        <li>
                            {`current spatial-temporal layers: ${consumerCurrentSpatialLayer} ${consumerCurrentTemporalLayer}`}
                        </li>
                        <li>
                            {`preferred spatial-temporal layers: ${consumerPreferredSpatialLayer} ${consumerPreferredTemporalLayer}`}
                        </li>
                    </ul>
                </div>
            ) : null}
        </>
    );
};
