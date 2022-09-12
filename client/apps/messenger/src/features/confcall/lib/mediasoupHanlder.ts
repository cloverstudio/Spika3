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
    connectionState: StreamingState;
    setConnectionState: (state: StreamingState) => void;
    roomId: number;
    peerId: string;
    videoStream: MediaStream;
    audioStream: MediaStream;
    captureStream: MediaStream;
    cameraReadyListner: (stream: MediaStream) => void;
    micReadyListner: (stream: MediaStream) => void;
    device: mediasoupClient.types.Device; // device means Browser here, not webcam or mic
    producerTransport: mediasoupClient.types.Transport;
    consumerTransport: mediasoupClient.types.Transport;
    videoProducer: mediasoupClient.types.Producer;
    audioProducer: mediasoupClient.types.Producer;
    screenShareProducer: mediasoupClient.types.Producer;
    consumers: Array<mediasoupClient.types.Consumer>;
    processing: boolean;

    constructor() {
        this.connectionState = StreamingState.NotJoined;
        this.processing = false;
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
        const [connectionState, setConnectionState] = useState<StreamingState>(
            StreamingState.NotJoined
        );
        this.setConnectionState = setConnectionState;
        this.connectionState = connectionState;
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
            if (!res?.data.transportParams) throw "Failed to connect";

            this.setConnectionState(StreamingState.Joind);
            this.rtpCapabilities = res.data.rtpCapabilities;
            this.peerId = res.data.peerId;

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

                    if (res.data.producerId) {
                        if (this.connectionState < StreamingState.StartStreaming)
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

            if (microphoneEnabled) {
                this.audioStream = await deviceHandler.getMicrophone(selectedMicrophone);
                this.micReadyListner && this.micReadyListner(this.audioStream);
                this.setConnectionState(StreamingState.AudioReady);

                this.audioProducer = await this.producerTransport.produce({
                    track: this.audioStream.getAudioTracks()[0],
                    codecOptions: {
                        opusStereo: true,
                        opusDtx: true,
                    },
                    appData: {
                        kind: "audio",
                    },
                });

                this.audioProducer.on("trackended", () => {
                    // close video track
                });

                this.audioProducer.on("transportclose", () => {
                    // close video track
                });

                this.setConnectionState(StreamingState.WaitingConsumer);
            }

            if (cameraEnabled) {
                this.videoStream = await deviceHandler.getCamera(selectedCamera);
                this.cameraReadyListner && this.cameraReadyListner(this.videoStream);
                this.setConnectionState(StreamingState.VideoReady);

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
                    codec: this.device.rtpCapabilities.codecs.find(
                        (codec) => codec.mimeType.toLowerCase() === "video/h264"
                    ),
                    appData: {
                        kind: "video",
                    },
                });

                this.videoProducer.on("trackended", () => {
                    // close video track
                });

                this.videoProducer.on("transportclose", () => {
                    // close video track
                });

                this.setConnectionState(StreamingState.WaitingConsumer);
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

        this.videoProducer?.close();
        this.audioProducer?.close();

        this.videoProducer = null;
        this.audioProducer = null;

        //await this.stopScreenshare();
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
                    rtpCapabilities: this.device.rtpCapabilities,
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
            this.setConnectionState(StreamingState.Established);
        }

        if (params.videoProducerId) {
            const resVideo = await dynamicBaseQuery({
                url: `/confcall/mediasoup/${this.roomId}/startConsuming`,
                method: "POST",
                data: {
                    roomId: this.roomId,
                    peerId: this.peerId,
                    producerId: params.videoProducerId,
                    rtpCapabilities: this.device.rtpCapabilities,
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
            this.setConnectionState(StreamingState.Established);
        }

        callBack(audioStream, videoStream);
    }

    async pauseVideo(callState: CallState) {
        const resVideo = await dynamicBaseQuery({
            url: `/confcall/mediasoup/${this.roomId}/pause`,
            method: "POST",
            data: {
                roomId: this.roomId,
                peerId: this.peerId,
                kind: "video",
            },
        });

        await this.videoProducer.pause();
    }

    async resumeVideo(callState: CallState) {
        if (!this.videoProducer) {
            this.startProduce(callState);
            return;
        }
        const resVideo = await dynamicBaseQuery({
            url: `/confcall/mediasoup/${this.roomId}/resume`,
            method: "POST",
            data: {
                roomId: this.roomId,
                peerId: this.peerId,
                kind: "video",
            },
        });

        await this.videoProducer.resume();
    }

    async pauseAudio(callState: CallState) {
        const resVideo = await dynamicBaseQuery({
            url: `/confcall/mediasoup/${this.roomId}/pause`,
            method: "POST",
            data: {
                roomId: this.roomId,
                peerId: this.peerId,
                kind: "audio",
            },
        });

        await this.audioProducer.pause();
    }

    async resumeAudio(callState: CallState) {
        if (!this.audioProducer) {
            this.startProduce(callState);
            return;
        }

        const resVideo = await dynamicBaseQuery({
            url: `/confcall/mediasoup/${this.roomId}/resume`,
            method: "POST",
            data: {
                roomId: this.roomId,
                peerId: this.peerId,
                kind: "audio",
            },
        });

        await this.audioProducer.resume();
    }

    async chengeCamera(deviceId: string): Promise<void> {
        this.videoStream = await deviceHandler.getCamera(deviceId);
        const newVideoTrack = this.videoStream.getVideoTracks()[0];
        await this.videoProducer.replaceTrack({ track: newVideoTrack });
        this.cameraReadyListner(this.videoStream);
    }

    async chengeMicrophone(deviceId: string): Promise<void> {
        this.audioStream = await deviceHandler.getMicrophone(deviceId);
        const newAudoiTrack = this.audioStream.getAudioTracks()[0];
        await this.audioProducer.replaceTrack({ track: newAudoiTrack });
    }

    async startScreenshare(closeListener: () => void): Promise<void> {
        if (this.processing) throw "Processing...";
        this.processing = true;

        try {
            this.captureStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: false,
            });

            this.screenShareProducer = await this.producerTransport.produce({
                track: this.captureStream.getVideoTracks()[0],
                codec: this.device.rtpCapabilities.codecs.find(
                    (codec) => codec.mimeType.toLowerCase() === "video/vp8"
                ),
                appData: {
                    kind: "screenshare",
                },
            });

            this.screenShareProducer.on("trackended", () => {
                // close video track
                console.log("screen share track end");
                if (closeListener) closeListener();
            });

            this.screenShareProducer.on("transportclose", () => {
                // close video track
                console.log("screen share transport close");
            });

            this.processing = false;
        } catch (err) {
            console.error(`Error: ${err}`);
            this.processing = false;
            throw err;
        }
    }

    async stopScreenshare(): Promise<void> {
        if (this.processing) throw "Processing...";
        this.processing = true;

        try {
            if (this.screenShareProducer) {
                this.screenShareProducer.close();

                const resVideo = await dynamicBaseQuery({
                    url: `/confcall/mediasoup/${this.roomId}/stopScreenshare`,
                    method: "POST",
                    data: {
                        roomId: this.roomId,
                        peerId: this.peerId,
                    },
                });
            }

            if (this.captureStream) {
                this.captureStream.getTracks().forEach((track) => track.stop());
            }
        } catch (e) {
            console.error(e);
            this.processing = false;
        }
        this.processing = false;
    }
}

export default new MediasoupHandler();
