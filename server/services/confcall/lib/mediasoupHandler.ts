import * as mediasoup from "mediasoup";
import { User } from "@prisma/client";

import l, { error as le, warn as lw } from "../../../components/logger";
import config from "./config";
import utils from "../../../components/utils";
import me from "../../messenger/route/me";

type Peer = {
    peerId: string;
    roomId: number;
    user: User;
    producerTransport?: mediasoup.types.WebRtcTransport;
    consumerTransport?: mediasoup.types.WebRtcTransport;
    producers?: Array<mediasoup.types.Producer>;
    consumers?: Array<mediasoup.types.Consumer>;
};

type Room = {
    roomId: number;
    router?: mediasoup.types.Router;
    peers: Array<Peer>;
};

export type CallParamsInDB = {
    videoProducerId: string;
    audioProducerId: string;
    screenshareProducerId: string;
    videoEnabled: boolean;
    audioEnabled: boolean;
};

const mediaCodecs: Array<any> = [
    {
        kind: "audio",
        mimeType: "audio/opus",
        clockRate: 48000,
        channels: 2,
    },
    {
        kind: "video",
        mimeType: "video/VP8",
        clockRate: 90000,
        parameters: {
            "x-google-start-bitrate": 1000,
        },
    },
];

const webRtcTransport_options = {
    listenIps: [
        {
            ip: process.env["MEDIASOUP_LISTEN_IP"] || "0.0.0.0", // replace with relevant IP address
            announcedIp: process.env["MEDIASOUP_ANNOUNCED_IP"] || "127.0.0.1",
        },
    ],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
};

class MediasoupHandler {
    mediasoupWorkers: Array<mediasoup.types.Worker>;
    rooms: Array<Room>;

    constructor() {
        const { numWorkers } = config.mediasoup;
        this.mediasoupWorkers = [];
        this.rooms = [];

        l("running %d mediasoup Workers...", numWorkers);

        (async () => {
            console.log(
                "config.mediasoup.workerSettings.logLevel",
                config.mediasoup.workerSettings.logLevel
            );

            for (let i = 0; i < numWorkers; ++i) {
                const worker = await mediasoup.createWorker({
                    logLevel: config.mediasoup.workerSettings
                        .logLevel as mediasoup.types.WorkerLogLevel,
                    logTags: config.mediasoup.workerSettings
                        .logTags as Array<mediasoup.types.WorkerLogTag>,
                    rtcMinPort: Number(config.mediasoup.workerSettings.rtcMinPort),
                    rtcMaxPort: Number(config.mediasoup.workerSettings.rtcMaxPort),
                });

                worker.on("died", () => {
                    le("mediasoup Worker died, exiting  in 2 seconds... [pid:%d]", worker.pid);

                    setTimeout(() => process.exit(1), 2000);
                });

                this.mediasoupWorkers.push(worker);

                // Log worker resource usage every X seconds.
                setInterval(async () => {
                    const usage = await worker.getResourceUsage();

                    //l("mediasoup Worker resource usage [pid:%d]: %o", worker.pid, usage);
                }, 120000);
            }
        })();
    }

    async join(
        roomId: number,
        user: User
    ): Promise<{
        peerId: string;
        transportParams: {
            id: any;
            iceParameters: any;
            iceCandidates: any;
            dtlsParameters: any;
        };
        rtpCapabilities: mediasoup.types.RtpCapabilities;
    }> {
        const peerId = utils.randomString(8);

        const newPeer: Peer = {
            peerId: peerId,
            roomId: roomId,
            user: user,
            producerTransport: null,
            consumerTransport: null,
            producers: [],
            consumers: [],
        };

        let existingRoom = this.rooms.find((room) => room.roomId === roomId);
        if (!existingRoom) {
            const resposibleWorker: mediasoup.types.Worker =
                this.mediasoupWorkers[roomId % this.mediasoupWorkers.length];

            const newRoom: Room = {
                roomId: roomId,
                router: await resposibleWorker.createRouter({ mediaCodecs }),
                peers: [],
            };

            existingRoom = newRoom;
            this.rooms.push(newRoom);
        }

        //find existing peer
        const findIndex = existingRoom.peers.findIndex((obj) => {
            return obj.user.id === user.id;
        });

        if (findIndex !== -1) existingRoom.peers.splice(findIndex, 1);

        existingRoom.peers.push(newPeer);

        // create audio and video transport
        newPeer.producerTransport = await existingRoom.router.createWebRtcTransport(
            webRtcTransport_options
        );

        return {
            peerId: newPeer.peerId,
            transportParams: {
                id: newPeer.producerTransport.id,
                iceParameters: newPeer.producerTransport.iceParameters,
                iceCandidates: newPeer.producerTransport.iceCandidates,
                dtlsParameters: newPeer.producerTransport.dtlsParameters,
            },
            rtpCapabilities: existingRoom.router.rtpCapabilities,
        };
    }

    async leave(roomId: number, user: User): Promise<void> {
        let roomIndex: number = -1;
        let existingRoom = this.rooms.find((room, index) => {
            roomIndex = index;
            return room.roomId === roomId;
        });

        if (!existingRoom) return;

        let peerIndex: number = -1;
        const peer = existingRoom.peers.find((peer, index) => {
            peerIndex = index;
            return peer.user.id === user.id;
        });

        // delete peer from the room
        if (peerIndex >= 0) {
            peer?.producerTransport?.close();
            existingRoom.peers.splice(peerIndex, 1);
        }

        // delete room if no one exists
        if (existingRoom.peers.length === 0) {
            existingRoom.router?.close();
            this.rooms.splice(roomIndex, 1);
        }

        return;
    }

    async transportConnect(
        roomId: number,
        peerId: string,
        dtlsParameters: mediasoup.types.DtlsParameters
    ) {
        let room = this.rooms.find((room, index) => {
            return room.roomId === roomId;
        });

        if (!room) throw "Invalid room id";

        let peer = room.peers.find((peer) => peer.peerId === peerId);

        if (!peer) throw "Invalid peer id";

        const provider = peer.producerTransport;
        if (!provider) throw "Invalid peer id";

        await provider!.connect({ dtlsParameters });
    }

    async produce(
        roomId: number,
        peerId: string,
        kind: mediasoup.types.MediaKind,
        rtpParameters: mediasoup.types.RtpParameters,
        appData: any
    ): Promise<string> {
        let room = this.rooms.find((room, index) => {
            return room.roomId === roomId;
        });

        if (!room) throw "Invalid room id";

        let peer = room.peers.find((peer) => peer.peerId === peerId);

        if (!peer) throw "Invalid peer id";

        const provider = peer.producerTransport;
        if (!provider) throw "Invalid peer id";

        // call produce based on the prameters from the client
        const producer: mediasoup.types.Producer = await provider.produce({
            kind: kind,
            rtpParameters: rtpParameters,
            appData: appData,
        });

        peer.producers.push(producer);

        return producer.id;
    }

    async newConsumerTransport(
        roomId: number,
        peerId: string
    ): Promise<mediasoup.types.WebRtcTransport> {
        let room = this.rooms.find((room, index) => {
            return room.roomId === roomId;
        });

        if (!room) throw "Invalid room id";

        let peer = room.peers.find((peer) => peer.peerId === peerId);

        if (!peer) throw "Invalid peer id";

        const provider = peer.producerTransport;
        if (!provider) throw "Invalid peer id";

        if (!peer.consumerTransport)
            peer.consumerTransport = await room.router.createWebRtcTransport(
                webRtcTransport_options
            );

        return peer.consumerTransport;
    }

    async consumerTransportConnect(
        roomId: number,
        peerId: string,
        dtlsParameters: any
    ): Promise<mediasoup.types.WebRtcTransport> {
        let room = this.rooms.find((room, index) => {
            return room.roomId === roomId;
        });

        if (!room) throw "Invalid room id";

        let peer = room.peers.find((peer) => peer.peerId === peerId);

        if (!peer) throw "Invalid peer id";

        const provider = peer.producerTransport;
        if (!provider) throw "Invalid peer id";

        if (!peer.consumerTransport) throw "consumer transport doesn't exist";

        await peer.consumerTransport.connect({ dtlsParameters });

        return peer.consumerTransport;
    }

    async startConsuming(
        roomId: number,
        peerId: string,
        producerId: string,
        kind: "audio" | "video",
        rtpCapabilities: any
    ): Promise<mediasoup.types.Consumer> {
        console.log("start consuming peerId", peerId);

        let room = this.rooms.find((room, index) => {
            return room.roomId === roomId;
        });

        if (!room) throw "Invalid room id";

        let peer = room.peers.find((peer) => peer.peerId === peerId);

        if (!peer) throw "Invalid peer id";

        const provider = peer.producerTransport;
        if (!provider) throw "Invalid peer id";

        if (!peer.consumerTransport) throw "consumer transport doesn't exist";

        if (
            !room.router.canConsume({
                producerId: producerId,
                rtpCapabilities,
            })
        )
            throw "Cannot consume";

        const consumer: mediasoup.types.Consumer = await peer.consumerTransport.consume({
            producerId: producerId,
            rtpCapabilities,
        });

        peer.consumers.push(consumer);

        return consumer;
    }

    async pause(roomId: number, peerId: string, kind: mediasoup.types.MediaKind): Promise<void> {
        let room = this.rooms.find((room, index) => {
            return room.roomId === roomId;
        });

        if (!room) throw "Invalid room id";

        let peer = room.peers.find((peer) => peer.peerId === peerId);

        if (!peer) throw "Invalid peer id";

        const provider = peer.producerTransport;
        if (!provider) throw "Invalid peer id";

        const producer = peer.producers.find((producer) => {
            return producer.kind === kind;
        });

        producer.pause();
    }

    async resume(roomId: number, peerId: string, kind: mediasoup.types.MediaKind): Promise<void> {
        let room = this.rooms.find((room, index) => {
            return room.roomId === roomId;
        });

        if (!room) throw "Invalid room id";

        let peer = room.peers.find((peer) => peer.peerId === peerId);

        if (!peer) throw "Invalid peer id";

        const provider = peer.producerTransport;
        if (!provider) throw "Invalid peer id";

        const producer = peer.producers.find((producer) => {
            return producer.kind === kind;
        });

        producer.resume();
    }

    async stopScreenshare(roomId: number, peerId: string): Promise<void> {
        let room = this.rooms.find((room, index) => {
            return room.roomId === roomId;
        });

        if (!room) throw "Invalid room id";

        let peer = room.peers.find((peer) => peer.peerId === peerId);

        if (!peer) throw "Invalid peer id";

        const provider = peer.producerTransport;
        if (!provider) throw "Invalid peer id";

        const producer = peer.producers.find((producer) => {
            return producer.appData.kind === "screenshare";
        });

        producer.close();
    }
}

export default new MediasoupHandler();
