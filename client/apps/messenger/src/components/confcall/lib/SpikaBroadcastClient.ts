import protooClient, { Peer } from "protoo-client";
import * as mediasoupClient from "mediasoup-client";
import { types as mediasoupClientTypes } from "mediasoup-client";
import React, { useState, useEffect } from "react";
import { Logger } from "./Logger";
import deviceInfo from "./deviceInfo";
import * as e2e from "./e2e";
import { ShorthandPropertyAssignment } from "typescript";
import { timeStamp } from "console";
import { mainModule } from "process";
import Utils from "./Utils";
import { utils } from "mocha";

const PC_PROPRIETARY_CONSTRAINTS = {
    optional: [{ googDscp: true }],
};

const VIDEO_CONSTRAINS: any = {
    qvga: { width: { ideal: 320 }, height: { ideal: 240 } },
    vga: { width: { ideal: 640 }, height: { ideal: 480 } },
    hd: { width: { ideal: 1280 }, height: { ideal: 720 } },
};

// Used for VP9 webcam video.
const WEBCAM_KSVC_ENCODINGS = [{ scalabilityMode: "S3T3_KEY" }];

// Used for simulcast screen sharing.
const SCREEN_SHARING_SIMULCAST_ENCODINGS = [
    { dtx: true, maxBitrate: 1500000 },
    { dtx: true, maxBitrate: 6000000 },
];

// Used for simulcast webcam video.
const WEBCAM_SIMULCAST_ENCODINGS = [
    { scaleResolutionDownBy: 4, maxBitrate: 500000 },
    { scaleResolutionDownBy: 2, maxBitrate: 1000000 },
    { scaleResolutionDownBy: 1, maxBitrate: 5000000 },
];

const EXTERNAL_VIDEO_SRC: string =
    "https://mediasouptest.clover.studio/resources/videos/video-audio-stereo.mp4";

interface SpikaBroacstLinstener {
    onStartVideo: (producer: mediasoupClient.types.Producer) => void;
    onStartAudio: (producer: mediasoupClient.types.Producer) => void;
    onStartShare: (producer: mediasoupClient.types.Producer) => void;
    onParticipantUpdate: (participants: Map<String, Participant>) => void;
    onMicrophoneStateChanged: (state: boolean) => void;
    onCameraStateChanged: (state: boolean) => void;
    onSpeakerStateChanged: () => void;
    onScreenShareStateChanged: (state: boolean) => void;
    onCallClosed: () => void;
    onJoined: () => void;
    onUpdateCameraDevice: () => void;
    onUpdateMicrophoneDevice: () => void;
    onUpdateSpeakerDevice: () => void;
    onLogging: (type: string, message: string) => void;
}

export async function getCameras(): Promise<Array<MediaDeviceInfo>> {
    const devices: Array<MediaDeviceInfo> = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((device: MediaDeviceInfo) => device.kind == "videoinput");
}

export async function getMicrophones(): Promise<Array<MediaDeviceInfo>> {
    const devices: Array<MediaDeviceInfo> = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((device: MediaDeviceInfo) => device.kind == "audioinput");
}

export interface Participant {
    id: string;
    displayName: string;
    peer: Peer;
    activeSpeaker: boolean;
    consumers: Array<mediasoupClient.types.Consumer>;
    consumerSpatialCurrentLayers?: Map<string, number>; // comsumerId, layer
    consumerTemporalCurrentLayers?: Map<string, number>; // comsumerId, layer
    consumerVideoLayerType?: Map<string, string>; // comsumerId, layerTyle
}

export interface SpikaBroadcastClientConstructorInterface {
    debug: boolean;
    hostUrl: string;
    roomId: string;
    peerId?: string;
    displayName: string;
    avatarUrl: string;
    listener?: SpikaBroacstLinstener;
    deviceHandlerName?: string;
    defaultCamera?: MediaDeviceInfo;
    defaultMicrophone?: MediaDeviceInfo;
    enableCamera?: boolean;
    enableMicrophone?: boolean;
}

export default class SpikaBroadcastClient {
    // member variables
    socketUrl: string;
    logger: Logger;
    protoo: Peer;
    deviceHandlerName: mediasoupClientTypes.BuiltinHandlerName;
    mediasoupDevice: mediasoupClientTypes.Device;
    sendTransport: mediasoupClientTypes.Transport;
    recvTransport: mediasoupClientTypes.Transport;
    e2eKey: string = null;
    displayName: string = "";
    browser: any = deviceInfo();
    micProducer: mediasoupClient.types.Producer = null;
    webcamProducer: mediasoupClient.types.Producer = null;
    shareProducer: mediasoupClient.types.Producer = null;
    webcams: Map<any, any> = null;
    webcam: any = {
        device: null,
        resolution: "hd",
    };
    microphone: MediaDeviceInfo = null;
    forceH264: boolean = false;
    forceVP9: boolean = false;
    externalVideo: any;
    externalVideoStream: MediaStream;
    consumers: Map<String, mediasoupClient.types.Consumer> = new Map<
        String,
        mediasoupClient.types.Consumer
    >();
    listeners: SpikaBroacstLinstener;
    participants: Map<String, Participant>;
    cameraEnabled: boolean;
    screenShareEnabled: boolean;
    micEnabled: boolean;

    // constructor
    constructor({
        debug,
        hostUrl,
        roomId,
        peerId,
        listener,
        displayName,
        avatarUrl,
        defaultCamera,
        defaultMicrophone,
        enableCamera,
        enableMicrophone,
    }: SpikaBroadcastClientConstructorInterface) {
        this.socketUrl = `${hostUrl}/?roomId=${roomId}&peerId=${peerId}`;
        this.logger = new Logger("SpikaBroadcast", debug);
        this.logger.addListener(listener.onLogging);

        this.logger.debug(`SocketUrl: ${this.socketUrl}`);
        this.listeners = listener;
        this.participants = new Map();
        this.cameraEnabled = enableCamera;
        this.micEnabled = enableMicrophone;
        this.screenShareEnabled = false;
        this.displayName = displayName;

        this.webcam.device = defaultCamera;
        this.microphone = defaultMicrophone;
    }

    async connect() {
        const protooTransport = new protooClient.WebSocketTransport(this.socketUrl);

        this.protoo = new protooClient.Peer(protooTransport);

        this.logger.debug("SpikaBroadcast constructor called");

        this.protoo.on("open", async () => {
            this.logger.debug("Protoo opened");
            this._join();
        });

        this.protoo.on("failed", () => {
            this.logger.error("Protoo connection error");
        });

        this.protoo.on("disconnected", () => {
            this.logger.debug("Protoo disconnected");

            // Close mediasoup Transports.
            if (this.sendTransport) {
                this.sendTransport.close();
                this.sendTransport = null;
            }

            if (this.recvTransport) {
                this.recvTransport.close();
                this.recvTransport = null;
            }
        });

        this.protoo.on("close", () => {
            this.logger.debug("Protoo closed");
        });

        this.protoo.on("request", async (request, accept, reject) => {
            this.logger.debug(`Protoo request: ${request.method}`);

            switch (request.method) {
                case "newConsumer": {
                    const {
                        peerId,
                        producerId,
                        id,
                        kind,
                        rtpParameters,
                        type,
                        appData,
                        producerPaused,
                    } = request.data;

                    try {
                        const consumer = await this.recvTransport.consume({
                            id,
                            producerId,
                            kind,
                            rtpParameters,
                            appData: { ...appData, peerId }, // Trick.
                        });

                        if (this.e2eKey && e2e.isSupported()) {
                            e2e.setupReceiverTransform(consumer.rtpReceiver);
                        }

                        this.logger.debug(`webcamProducer ${consumer.id}`);

                        // Store in the map.
                        this.consumers.set(consumer.id, consumer);

                        consumer.on("transportclose", () => {
                            const participant: Participant = this.participants.get(
                                consumer.appData.peerId
                            );
                            if (participant)
                                participant.consumers = participant.consumers.filter(
                                    (c) => c.id !== consumer.id
                                );
                        });

                        const { spatialLayers, temporalLayers } =
                            mediasoupClient.parseScalabilityMode(
                                consumer.rtpParameters.encodings[0].scalabilityMode
                            );

                        const participant: Participant = this.participants.get(
                            consumer.appData.peerId
                        );

                        if (participant) participant.consumers.push(consumer);
                        if (participant) participant.consumerVideoLayerType.set(consumer.id, type);

                        if (this.listeners.onParticipantUpdate)
                            this.listeners.onParticipantUpdate(this.participants);

                        // We are ready. Answer the protoo request so the server will
                        // resume this Consumer (which was paused for now if video).
                        accept();
                    } catch (error) {
                        this.logger.error(`newConsumer request failed`);

                        throw error;
                    }

                    break;
                }

                case "newDataConsumer": {
                    break;
                }
            }
        });

        this.protoo.on("notification", (notification) => {
            this.logger.debug(`Protoo notification: ${notification.method}`);

            switch (notification.method) {
                case "producerScore": {
                    break;
                }
                case "newPeer": {
                    const peer = notification.data;

                    this.participants.set(peer.id, {
                        id: peer.id,
                        displayName: peer.displayName,
                        peer,
                        consumers: [],
                        consumerVideoLayerType: new Map(),
                        consumerSpatialCurrentLayers: new Map(),
                        consumerTemporalCurrentLayers: new Map(),
                        activeSpeaker: false,
                    });

                    if (this.listeners.onParticipantUpdate)
                        this.listeners.onParticipantUpdate(this.participants);

                    break;
                }
                case "peerClosed": {
                    const peerId = notification.data.peerId;
                    this.participants.delete(peerId);

                    this.logger.debug(`peer closed ${peerId}`);

                    if (this.listeners.onParticipantUpdate)
                        this.listeners.onParticipantUpdate(this.participants);

                    break;
                }
                case "peerDisplayNameChanged": {
                    const { peerId, displayName } = notification.data;
                    const participant: Participant = this.participants.get(peerId);
                    const peer = notification.data;
                    participant.displayName = displayName;
                    this.participants.set(peerId, participant);

                    if (this.listeners.onParticipantUpdate)
                        this.listeners.onParticipantUpdate(this.participants);
                }
                case "consumerClosed": {
                    const { consumerId } = notification.data;
                    const consumer = this.consumers.get(consumerId);
                    if (!consumer) break;
                    consumer.close();
                    this.consumers.delete(consumerId);

                    const participant = this.participants.get(consumer.appData.peerId);
                    if (participant)
                        participant.consumers = participant.consumers.filter(
                            (c) => c.id !== consumer.id
                        );

                    if (this.listeners.onParticipantUpdate)
                        this.listeners.onParticipantUpdate(this.participants);

                    break;
                }
                case "consumerPaused": {
                    const { consumerId } = notification.data;
                    const consumer = this.consumers.get(consumerId);

                    if (!consumer) break;

                    consumer.pause();

                    if (this.listeners.onParticipantUpdate)
                        this.listeners.onParticipantUpdate(new Map(this.participants));

                    break;
                }
                case "consumerResumed": {
                    const { consumerId } = notification.data;
                    const consumer = this.consumers.get(consumerId);

                    if (!consumer) break;

                    consumer.resume();

                    if (this.listeners.onParticipantUpdate)
                        this.listeners.onParticipantUpdate(new Map(this.participants));

                    break;
                }
                case "consumerLayersChanged": {
                    const { consumerId, spatialLayer, temporalLayer } = notification.data;
                    const consumer = this.consumers.get(consumerId);
                    if (!consumer) break;

                    const participant = this.participants.get(consumer.appData.peerId);

                    if (!participant) break;

                    participant.consumerSpatialCurrentLayers.set(consumerId, spatialLayer);

                    participant.consumerTemporalCurrentLayers.set(consumerId, temporalLayer);

                    if (this.listeners.onParticipantUpdate)
                        this.listeners.onParticipantUpdate(this.participants);

                    break;
                }
                case "consumerScore": {
                    break;
                }
                case "dataConsumerClosed": {
                    break;
                }
                case "activeSpeaker": {
                    const { peerId } = notification.data;

                    // turn all participant off
                    this.participants.forEach((participant, peerId) => {
                        participant.activeSpeaker = false;
                        this.participants.set(peerId, participant);
                    });

                    if (peerId) {
                        const participant: Participant = this.participants.get(peerId);
                        participant.activeSpeaker = true;
                        this.participants.set(peerId, participant);
                    }

                    if (this.listeners.onParticipantUpdate)
                        this.listeners.onParticipantUpdate(this.participants);
                }
                default: {
                    /*
          this.logger.error(
            `unknown protoo notification.method ${notification.method}`
          );
            */
                }
            }
        });
    }
    async pause() {}
    async resume() {}
    async disconnect() {
        // Close protoo Peer
        this.protoo.close();

        // Close mediasoup Transports.

        await this._disableWebcam();
        await this._disableMic();

        if (this.sendTransport) this.sendTransport.close();
        if (this.recvTransport) this.recvTransport.close();
    }
    async setCameraDevice() {}
    async setMicrophoneDevice() {}
    async setSpeakerDevice() {}

    async updateCamera(device: MediaDeviceInfo) {
        this.webcam.device = device;
        await this._disableWebcam();
        await this._enableWebcam();
    }

    async toggleCamera() {
        let success: boolean = false;

        if (this.cameraEnabled) success = await this._disableWebcam();
        else success = await this._enableWebcam();

        if (success) {
            this.cameraEnabled = !this.cameraEnabled;

            if (this.listeners.onCameraStateChanged)
                this.listeners.onCameraStateChanged(this.cameraEnabled);
        }
    }
    async toggleScreenShare() {
        let success: boolean = false;

        if (this.screenShareEnabled) {
            success = await this._disableScreenShare();
        } else success = await this._enableScreenShare();

        if (success) {
            this.screenShareEnabled = !this.screenShareEnabled;
            console.log("this.screenShareEnabled", this.screenShareEnabled);
            if (this.listeners.onScreenShareStateChanged)
                this.listeners.onScreenShareStateChanged(this.screenShareEnabled);
        }
    }

    async updateMicrophone(device: MediaDeviceInfo) {
        this.microphone = device;
        await this._disableMic();
        await this._enableMic();
    }

    async toggleMicrophone() {
        if (!this.micProducer) {
            this.logger.warn("Microphone is not ready");
            return;
        }

        if (this.micEnabled) {
            // mute
            try {
                this.micProducer.pause();
                await this.protoo.request("pauseProducer", {
                    producerId: this.micProducer.id,
                });

                this.micEnabled = false;

                if (this.listeners.onMicrophoneStateChanged)
                    this.listeners.onMicrophoneStateChanged(this.micEnabled);
            } catch (e) {
                this.logger.error("toggleMicrophone() failed");
                this.logger.error(`<span class="small">${Utils.printObj(e)}</span>`);
            }
        } else {
            //unmute
            try {
                this.micProducer.resume();
                await this.protoo.request("resumeProducer", {
                    producerId: this.micProducer.id,
                });

                this.micEnabled = true;

                if (this.listeners.onMicrophoneStateChanged)
                    this.listeners.onMicrophoneStateChanged(this.micEnabled);
            } catch (e) {
                this.logger.error("toggleMicrophone() failed");
                this.logger.error(`<span class="small">${Utils.printObj(e)}</span>`);
            }
        }
    }

    async changeDisplayName(displayName: string): Promise<void> {
        await this.protoo.request("changeDisplayName", { displayName });
    }

    getCameraState() {
        return this.cameraEnabled;
    }

    getMicrophoneState() {
        return this.micEnabled;
    }

    async _join() {
        this.logger.debug("start join ");

        this.mediasoupDevice = new mediasoupClient.Device({
            handlerName: this.deviceHandlerName,
        });

        const routerRtpCapabilities = await this.protoo.request("getRouterRtpCapabilities");

        this.logger.debug("↓routerRtpCapabilities");
        //this.logger.debug(
        //  `<span class="small">${Utils.printObj(routerRtpCapabilities)}</span>`
        //);

        await this.mediasoupDevice.load({ routerRtpCapabilities });
        // NOTE: Stuff to play remote audios due to browsers' new autoplay policy.
        //
        // Just get access to the mic and DO NOT close the mic track for a while.
        // Super hack!

        {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const audioTrack = stream.getAudioTracks()[0];
            audioTrack.enabled = false;
            setTimeout(() => audioTrack.stop(), 120000);
        }

        const transportInfo = await this.protoo.request("createWebRtcTransport", {
            forceTcp: false,
            producing: true,
            consuming: false,
            sctpCapabilities: this.mediasoupDevice.sctpCapabilities,
        });

        //this.logger.debug("↓transportInfo");
        //this.logger.debug(
        //  `<span class="small">${Utils.printObj(transportInfo)}</span>`
        //);

        const { id, iceParameters, iceCandidates, dtlsParameters, sctpParameters } = transportInfo;

        this.sendTransport = this.mediasoupDevice.createSendTransport({
            id,
            iceParameters,
            iceCandidates,
            dtlsParameters,
            sctpParameters,
            iceServers: [],
            proprietaryConstraints: PC_PROPRIETARY_CONSTRAINTS,
            additionalSettings: {
                encodedInsertableStreams: this.e2eKey,
            },
        });

        this.sendTransport.on(
            "connect",
            async (
                { dtlsParameters },
                callback,
                errback // eslint-disable-line no-shadow
            ) => {
                try {
                    this.logger.debug("Transport connected");

                    const params = await this.protoo.request("connectWebRtcTransport", {
                        transportId: this.sendTransport.id,
                        dtlsParameters,
                    });

                    callback();
                } catch (error) {
                    errback(error);

                    this.logger.debug(`sendTransport error on connect`);
                    this.logger.error(`<span class="small">${Utils.printObj(error)}</span>`);
                }
            }
        );

        this.sendTransport.on(
            "produce",
            async ({ kind, rtpParameters, appData }, callback, errback) => {
                try {
                    this.logger.debug(`Transport produce ${kind}`);

                    const produceResult = await this.protoo.request("produce", {
                        transportId: this.sendTransport.id,
                        kind,
                        rtpParameters,
                        appData,
                    });

                    this.logger.debug(`Transport produceResult`);

                    callback({ id: produceResult.id });
                } catch (error) {
                    errback(error);

                    this.logger.debug(`sendTransport error on produce`);
                    this.logger.error(`<span class="small">${Utils.printObj(error)}</span>`);
                }
            }
        );

        this.sendTransport.on(
            "producedata",
            async ({ sctpStreamParameters, label, protocol, appData }, callback, errback) => {
                try {
                    // eslint-disable-next-line no-shadow
                    const { id } = await this.protoo.request("produceData", {
                        transportId: this.sendTransport.id,
                        sctpStreamParameters,
                        label,
                        protocol,
                        appData,
                    });

                    callback({ id });
                } catch (error) {
                    errback(error);

                    this.logger.debug(`sendTransport error on producedata`);
                    this.logger.error(`<span class="small">${Utils.printObj(error)}</span>`);
                }
            }
        );

        this.sendTransport.on("connectionstatechange", (connectionState) => {
            this.logger.debug(`connectionstatechange ${connectionState}`);
        });

        const rcvTransportInfo = await this.protoo.request("createWebRtcTransport", {
            forceTcp: false,
            producing: false,
            consuming: true,
            sctpCapabilities: undefined,
        });

        this.recvTransport = this.mediasoupDevice.createRecvTransport({
            id: rcvTransportInfo.id,
            iceParameters: rcvTransportInfo.iceParameters,
            iceCandidates: rcvTransportInfo.iceCandidates,
            dtlsParameters: rcvTransportInfo.dtlsParameters,
            sctpParameters: rcvTransportInfo.sctpParameters,
            iceServers: [],
            additionalSettings: {
                encodedInsertableStreams: this.e2eKey,
            },
        });

        this.recvTransport.on(
            "connect",
            (
                { dtlsParameters },
                callback,
                errback // eslint-disable-line no-shadow
            ) => {
                this.logger.debug("consumer transport connected");

                this.protoo
                    .request("connectWebRtcTransport", {
                        transportId: this.recvTransport.id,
                        dtlsParameters,
                    })
                    .then(callback)
                    .catch(errback);
            }
        );

        const { peers } = await this.protoo.request("join", {
            displayName: this.displayName,
            device: this.browser,
            rtpCapabilities: this.mediasoupDevice.rtpCapabilities,
            sctpCapabilities: this.mediasoupDevice.sctpCapabilities,
        });

        peers.map((peer: any) => {
            this.participants.set(peer.id, {
                id: peer.id,
                displayName: peer.displayName,
                peer: peer,
                consumers: [],
                consumerVideoLayerType: new Map(),
                consumerSpatialCurrentLayers: new Map(),
                consumerTemporalCurrentLayers: new Map(),
                activeSpeaker: false,
            });

            this.logger.debug(`new peer ${peer.id}`);
        });

        if (this.listeners.onParticipantUpdate)
            this.listeners.onParticipantUpdate(this.participants);

        await this._enableMic();

        if (!this.micEnabled) {
            // set initial state of mic
            await this.micProducer.pause();
            await this.protoo.request("pauseProducer", {
                producerId: this.micProducer.id,
            });
        }

        console.log("10");

        if (this.cameraEnabled) await this._enableWebcam();

        if (this.listeners.onJoined) this.listeners.onJoined();
    }

    async _enableMic() {
        this.logger.debug("enableMic()");

        if (this.micProducer) return;

        if (!this.mediasoupDevice.canProduce("audio")) {
            this.logger.error("enableMic() | cannot produce audio");
            return;
        }

        let track;

        try {
            if (!this.microphone) {
                const devices: Array<MediaDeviceInfo> =
                    await navigator.mediaDevices.enumerateDevices();
                const microphones: Array<MediaDeviceInfo> = devices.filter(
                    (device: MediaDeviceInfo) => device.kind == "audioinput"
                );
                this.microphone = microphones[0];
            }
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    deviceId: this.microphone.deviceId,
                },
            });

            track = stream.getAudioTracks()[0];

            this.micProducer = await this.sendTransport.produce({
                track,
                codecOptions: {
                    opusStereo: true,
                    opusDtx: true,
                },
                // NOTE: for testing codec selection.
                // codec : this._mediasoupDevice.rtpCapabilities.codecs
                // 	.find((codec) => codec.mimeType.toLowerCase() === 'audio/pcma')
            });

            if (this.listeners.onStartAudio) this.listeners.onStartAudio(this.micProducer);

            if (this.e2eKey && e2e.isSupported()) {
                e2e.setupSenderTransform(this.micProducer.rtpSender);
            }

            this.micProducer.on("newtransport", () => {
                this.logger.debug("new mic transport");
            });

            this.micProducer.on("transportclose", () => {
                this.micProducer = null;
            });

            this.micProducer.on("trackended", () => {
                this._disableMic().catch(() => {});
            });
        } catch (error) {
            this.logger.error("enableMic() failed");
            this.logger.error(`<span class="small">${Utils.printObj(error)}</span>`);

            if (track) track.stop();
        }
    }

    async _disableMic() {
        this.logger.debug("disableMic()");

        if (!this.micProducer) return;

        this.micProducer.close();

        try {
            await this.protoo.request("closeProducer", {
                producerId: this.micProducer.id,
            });
        } catch (error) {
            this.logger.error("disable() failed");
            this.logger.error(`<span class="small">${Utils.printObj(error)}</span>`);
        }

        this.micProducer = null;
    }

    async _getExternalVideoStream() {
        if (this.externalVideoStream) return this.externalVideoStream;

        if (this.externalVideo.readyState < 3) {
            await new Promise((resolve) => this.externalVideo.addEventListener("canplay", resolve));
        }

        if (this.externalVideo.captureStream)
            this.externalVideoStream = this.externalVideo.captureStream();
        else if (this.externalVideo.mozCaptureStream)
            this.externalVideoStream = this.externalVideo.mozCaptureStream();
        else throw new Error("video.captureStream() not supported");

        return this.externalVideoStream;
    }

    async _enableWebcam() {
        this.logger.debug("enableWebcam()");

        if (this.webcamProducer) return false;

        if (!this.mediasoupDevice.canProduce("video")) {
            this.logger.error("enableWebcam() | cannot produce video");
            return false;
        }

        let track;
        let device;

        try {
            if (!this.externalVideo) {
                await this._updateWebcams();
                device = this.webcam.device;

                const { resolution } = this.webcam;

                if (!device) throw new Error("no webcam devices");

                this.logger.debug("enableWebcam() | calling getUserMedia()");

                const stream: MediaStream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        deviceId: { ideal: device.deviceId },
                        ...VIDEO_CONSTRAINS[resolution],
                    },
                });

                track = stream.getVideoTracks()[0];
            } else {
                this.logger.debug("enableWebcam() | calling _getExternalVideoStream()");

                device = { label: "external video" };
                const stream = await this._getExternalVideoStream();
                track = stream.getVideoTracks()[0].clone();
            }

            let encodings;
            let codec;
            const codecOptions = {
                videoGoogleStartBitrate: 1000,
            };

            if (this.forceH264) {
                codec = this.mediasoupDevice.rtpCapabilities.codecs.find(
                    (c) => c.mimeType.toLowerCase() === "video/h264"
                );

                if (!codec) {
                    throw new Error("desired H264 codec+configuration is not supported");
                }
            } else if (this.forceVP9) {
                codec = this.mediasoupDevice.rtpCapabilities.codecs.find(
                    (c) => c.mimeType.toLowerCase() === "video/vp9"
                );

                if (!codec) {
                    throw new Error("desired VP9 codec+configuration is not supported");
                }
            }

            // If VP9 is the only available video codec then use SVC.
            const firstVideoCodec = this.mediasoupDevice.rtpCapabilities.codecs.find(
                (c) => c.kind === "video"
            );

            if (
                (this.forceVP9 && codec) ||
                firstVideoCodec.mimeType.toLowerCase() === "video/vp9"
            ) {
                encodings = WEBCAM_KSVC_ENCODINGS;
            } else {
                encodings = WEBCAM_SIMULCAST_ENCODINGS;
            }

            this.webcamProducer = await this.sendTransport.produce({
                track,
                encodings,
                codecOptions,
                codec,
            });

            //this.logger.debug("webcamProducer");
            //this.logger.debug(
            //  `<span class="small">${Utils.printObj(this.webcamProducer)}</span>`
            //);

            if (this.listeners.onStartVideo) this.listeners.onStartVideo(this.webcamProducer);

            if (this.e2eKey && e2e.isSupported()) {
                e2e.setupSenderTransform(this.webcamProducer.rtpSender);
            }

            this.webcamProducer.on("transportclose", () => {
                this.logger.debug("webcam transportclose");
                this.webcamProducer = null;
            });

            this.webcamProducer.on("trackended", () => {
                this.logger.debug("webcam trackended");
                this._disableWebcam().catch(() => {});
            });

            return true;
        } catch (error) {
            this.logger.error("enableWebcam() failed");
            this.logger.error(`<span class="small">${Utils.printObj(error)}</span>`);

            if (track) track.stop();
            return false;
        }
    }

    async _disableWebcam() {
        this.logger.debug("disableWebcam()");

        if (!this.webcamProducer) return false;

        this.webcamProducer.close();

        try {
            await this.protoo.request("closeProducer", {
                producerId: this.webcamProducer.id,
            });
        } catch (error) {
            this.logger.error("closeProducer failed");
            return false;
        }

        this.webcamProducer = null;
        return true;
    }

    async _updateWebcams() {
        this.logger.debug("_updateWebcams()");

        // Reset the list.
        this.webcams = new Map();
        this.logger.debug("_updateWebcams() | calling enumerateDevices()");

        const devices = await navigator.mediaDevices.enumerateDevices();

        //this.logger.debug("mediaDevices");
        //this.logger.debug(`<span class="small">${Utils.printObj(devices)}</span>`);

        for (const device of devices) {
            if (device.kind !== "videoinput") continue;

            //this.logger.debug("webcam found");
            //this.logger.debug(`<span class="small">${Utils.printObj(device)}</span>`);

            this.webcams.set(device.deviceId, device);
        }

        const array = Array.from(this.webcams.values());
        const len = array.length;
        const currentWebcamId = this.webcam.device ? this.webcam.device.deviceId : undefined;

        this.logger.debug(`update webcams currentWebcamId ${currentWebcamId}, cam number ${len}`);

        if (len === 0) this.webcam.device = null;
        else if (!this.webcams.has(currentWebcamId)) this.webcam.device = array[0];
    }

    async _disableScreenShare() {
        this.logger.debug("disableShare()");

        if (!this.shareProducer) return false;

        this.shareProducer.close();

        try {
            await this.protoo.request("closeProducer", { producerId: this.shareProducer.id });
        } catch (error) {
            this.logger.error("failed to dislable screen share");
            return false;
        }

        this.shareProducer = null;
        return true;
    }

    async _enableScreenShare() {
        this.logger.debug("enableShare()");

        if (this.shareProducer) return false;

        if (!this.mediasoupDevice.canProduce("video")) {
            this.logger.error("enableShare() | cannot produce video");
            return false;
        }

        let track;

        try {
            this.logger.debug("enableShare() | calling getUserMedia()");

            const stream = await navigator.mediaDevices.getDisplayMedia({
                audio: false,
                video: true,
            });

            // May mean cancelled (in some implementations).
            if (!stream) {
                return;
            }

            track = stream.getVideoTracks()[0];

            let encodings;
            let codec;
            const codecOptions = {
                videoGoogleStartBitrate: 1000,
            };

            if (this.forceH264) {
                codec = this.mediasoupDevice.rtpCapabilities.codecs.find(
                    (c) => c.mimeType.toLowerCase() === "video/h264"
                );

                if (!codec) {
                    throw new Error("desired H264 codec+configuration is not supported");
                }
            } else if (this.forceVP9) {
                codec = this.mediasoupDevice.rtpCapabilities.codecs.find(
                    (c) => c.mimeType.toLowerCase() === "video/vp9"
                );

                if (!codec) {
                    throw new Error("desired VP9 codec+configuration is not supported");
                }
            }

            this.shareProducer = await this.sendTransport.produce({
                track,
                encodings,
                codecOptions,
                codec,
                appData: {
                    share: true,
                },
            });

            if (this.listeners.onStartShare) this.listeners.onStartShare(this.shareProducer);

            if (this.e2eKey && e2e.isSupported()) {
                e2e.setupSenderTransform(this.shareProducer.rtpSender);
            }

            this.shareProducer.on("transportclose", () => {
                this.shareProducer = null;
            });

            this.shareProducer.on("trackended", () => {
                this._disableScreenShare().catch(() => {});
            });

            return true;
        } catch (error) {
            this.logger.error("enableShare() | failed:%o");

            if (track) track.stop();

            return false;
        }
    }
}
