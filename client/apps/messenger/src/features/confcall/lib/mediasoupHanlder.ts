import React, { useEffect, useState, useRef } from "react";
import * as mediasoupClient from "mediasoup-client";

import { CallState } from "../slice/callSlice";
import { dynamicBaseQuery } from "../../../api/api";
import deviceHandler from "./deviceHandler";
import { mediasoup } from "../../../../../../../server/services/confcall/lib/config";

export enum StreamingState {
    NotJoined,
    Joind,
    AudioReady,
    VideoReady,
    StartStreaming,
    WaitingConsumer,
    Established,
    Error,
}

export enum EventType {
    CameraReady,
    MicReady,
}

class MediasoupHandler {
    rtpCapabilities: mediasoupClient.types.RtpCapabilities;
    streamingState: StreamingState;
    setConnectionState: (state: StreamingState) => void;
    roomId: number;
    peerId: string;
    videoStream: MediaStream;
    audioStream: MediaStream;
    cameraReadyListner: (stream: MediaStream) => void;
    micReadyListner: (stream: MediaStream) => void;
    device: mediasoupClient.types.Device; // device means Browser here, not webcam or mic
    producerTransport: mediasoupClient.types.Transport;
    consumerTransport: mediasoupClient.types.Transport;
    videoProducer: mediasoupClient.types.Producer;
    audioProducer: mediasoupClient.types.Producer;
    consumers: Array<mediasoupClient.types.Consumer>;

    constructor() {
        this.streamingState = StreamingState.NotJoined;
    }

    // events
    onCameraReady(func: (stream: MediaStream) => void) {
        this.cameraReadyListner = func;
    }

    onMicrophoneReady(func: (stream: MediaStream) => void) {
        this.micReadyListner = func;
    }

    // custom hook
    useConnectionStatus() {
        const [connectionState, setConnectionState] = useState<StreamingState>(this.streamingState);
        this.setConnectionState = setConnectionState;
        return connectionState;
    }

    // tell to the server the user is open the confcall
    // setup producer and consumer transport

    async connectToServer(roomId: number) {
        try {
            this.roomId = roomId;

            const res = await dynamicBaseQuery({
                url: `/confcall/mediasoup/${this.roomId}/join`,
            });

            if (!res?.data.rtpCapabilities) throw "Failed to connect";
            if (!res?.data.peerId) throw "Failed to connect";

            this.setConnectionState(StreamingState.Joind);
            this.rtpCapabilities = res.data.rtpCapabilities;
            this.peerId = res.data.peerId;
            const videoTransportParams = res.data.videoTransportParams;

            // create device
            this.device = new mediasoupClient.Device();

            await this.device.load({
                routerRtpCapabilities: this.rtpCapabilities,
            });

            this.producerTransport = this.device.createSendTransport(res.data.transportParams);

            this.producerTransport.on("connect", async ({ dtlsParameters }, callback, errback) => {
                try {
                    const res = await dynamicBaseQuery({
                        url: `/confcall/mediasoup/${this.roomId}/transportConnect`,
                        method: "POST",
                        data: {
                            peerId: this.peerId,
                            dtlsParameters,
                        },
                    });

                    callback();
                } catch (error) {
                    console.error(error);
                    this.stop();
                }
            });

            this.producerTransport.on("produce", async (parameters, callback, errback) => {
                try {
                    const res = await dynamicBaseQuery({
                        url: `/confcall/mediasoup/${this.roomId}/transportProduce`,
                        method: "POST",
                        data: {
                            peerId: this.peerId,
                            kind: parameters.kind,
                            rtpParameters: parameters.rtpParameters,
                            appData: parameters.appData,
                        },
                    });

                    console.log("res.data.producerId", res.data.producerId);

                    if (res.data.producerId) {
                        this.setConnectionState(StreamingState.StartStreaming);
                        callback({ id: res.data.producerId });
                    }
                } catch (error) {
                    console.error(error);
                    this.stop();
                }
            });

            const consumerTransportRes = await dynamicBaseQuery({
                url: `/confcall/mediasoup/${this.roomId}/receiveTransport`,
                method: "POST",
                data: {
                    roomId: this.roomId,
                    peerId: this.peerId,
                },
            });

            this.consumerTransport = this.device.createRecvTransport(consumerTransportRes.data);

            this.consumerTransport.on("connect", async ({ dtlsParameters }, callback, errback) => {
                const res = await dynamicBaseQuery({
                    url: `/confcall/mediasoup/${this.roomId}/receiverConnected`,
                    method: "POST",
                    data: {
                        roomId: this.roomId,
                        peerId: this.peerId,
                        dtlsParameters,
                    },
                });

                callback();
            });
        } catch (e) {
            console.error(e);
            this.stop();
        }
    }

    async startProduce(initialParams: CallState) {
        try {
            const { roomId, microphoneEnabled, cameraEnabled, selectedCamera, selectedMicrophone } =
                initialParams;

            if (microphoneEnabled || cameraEnabled) {
                if (cameraEnabled) {
                    this.videoStream = await deviceHandler.getCamera(selectedCamera);
                    this.cameraReadyListner && this.cameraReadyListner(this.videoStream);
                    this.setConnectionState(StreamingState.VideoReady);
                }

                if (microphoneEnabled) {
                    this.audioStream = await deviceHandler.getMicrophone(selectedMicrophone);
                    this.micReadyListner && this.micReadyListner(this.audioStream);
                    this.setConnectionState(StreamingState.AudioReady);
                }

                this.videoProducer = await this.producerTransport.produce({
                    track: this.videoStream.getVideoTracks()[0],
                    encodings: [
                        {
                            rid: "r0",
                            maxBitrate: 100000,
                            scalabilityMode: "S1T3",
                        },
                        {
                            rid: "r1",
                            maxBitrate: 300000,
                            scalabilityMode: "S1T3",
                        },
                        {
                            rid: "r2",
                            maxBitrate: 900000,
                            scalabilityMode: "S1T3",
                        },
                    ],
                    // https://mediasoup.org/documentation/v3/mediasoup-client/api/#ProducerCodecOptions
                    codecOptions: {
                        videoGoogleStartBitrate: 1000,
                    },
                });

                this.audioProducer = await this.producerTransport.produce({
                    track: this.audioStream.getAudioTracks()[0],
                    codecOptions: {
                        opusStereo: true,
                        opusDtx: true,
                    },
                });

                this.videoProducer.on("trackended", () => {
                    console.log("track ended");

                    // close video track
                });

                this.videoProducer.on("transportclose", () => {
                    console.log("transport ended");

                    // close video track
                });

                this.audioProducer.on("trackended", () => {
                    console.log("track ended");

                    // close video track
                });

                this.audioProducer.on("transportclose", () => {
                    console.log("transport ended");

                    // close video track
                });
            } else {
                // spectator mode
            }
        } catch (e) {
            console.error(e);
            this.stop();
        }
    }

    async stop() {
        this.setConnectionState(StreamingState.Error);
        deviceHandler.closeAllDevices();
        const res = await dynamicBaseQuery({
            url: `/confcall/mediasoup/${this.roomId}/leave`,
        });

        this.cameraReadyListner = null;
        this.micReadyListner = null;
    }
    async startConsume(
        params: { audioProducerId?: string; videoProducerId?: string },
        callBack: (audioStream: MediaStream, videoStream: MediaStream) => void
    ) {
        let audioStream: MediaStream;
        let videoStream: MediaStream;

        if (params.audioProducerId) {
            const resAudio = await dynamicBaseQuery({
                url: `/confcall/mediasoup/${this.roomId}/startConsuming`,
                method: "POST",
                data: {
                    roomId: this.roomId,
                    peerId: this.peerId,
                    producerId: params.audioProducerId,
                    rtpCapabilities: this.rtpCapabilities,
                    kind: "audio",
                },
            });

            const audioConsumer: mediasoupClient.types.Consumer =
                await this.consumerTransport.consume({
                    id: resAudio.data.id,
                    producerId: params.audioProducerId,
                    kind: "audio",
                    rtpParameters: resAudio.data.rtpParameters,
                });

            audioStream = new MediaStream([audioConsumer.track]);
        }

        if (params.videoProducerId) {
            const resVideo = await dynamicBaseQuery({
                url: `/confcall/mediasoup/${this.roomId}/startConsuming`,
                method: "POST",
                data: {
                    roomId: this.roomId,
                    peerId: this.peerId,
                    producerId: params.videoProducerId,
                    rtpCapabilities: this.rtpCapabilities,
                    kind: "video",
                },
            });

            const videoConsumer: mediasoupClient.types.Consumer =
                await this.consumerTransport.consume({
                    id: resVideo.data.id,
                    producerId: params.videoProducerId,
                    kind: "video",
                    rtpParameters: resVideo.data.rtpParameters,
                });

            videoStream = new MediaStream([videoConsumer.track]);
        }

        callBack(audioStream, videoStream);
    }
}

export default new MediasoupHandler();
