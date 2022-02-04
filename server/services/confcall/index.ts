import express, { Router, Request, Response } from "express";
import amqp from "amqplib";
import * as Constants from "../../components/consts";
import Service, { ServiceStartParams } from "../types/serviceInterface";
import { SendSMSPayload } from "../types/queuePayloadTypes";
import l, { error as le, warn as lw } from "../../components/logger";
import { RmOptions } from "fs";
import { type } from "os";
import http from "http";
const url = require("url");

import protoo from "protoo-server";
import * as mediasoup from "mediasoup";
import { AwaitQueue } from "awaitqueue";
import Logger from "./lib/Logger";
import Room from "./lib/Room";
import interactiveServer from "./lib/interactiveServer";
import interactiveClient from "./lib/interactiveClient";
import config from "./config";

interface RoomRequest extends Request {
    room: Room;
}

export default class ConfcallService implements Service {
    testString: string = "test test";
    mediasoupWorkers: Array<mediasoup.types.Worker> = [];
    rooms: Map<Number, Room> = new Map();
    protooWebSocketServer: protoo.WebSocketServer;
    server?: http.Server;
    queue: AwaitQueue;
    nextMediasoupWorkerIdx: number = 0;

    async start({ rabbitMQChannel, server }: ServiceStartParams): Promise<void> {
        this.server = server;
        this.queue = new AwaitQueue();

        // Open the interactive server.
        await interactiveServer();

        // Open the interactive client.
        if (process.env.INTERACTIVE === "true" || process.env.INTERACTIVE === "1")
            await interactiveClient();

        // Run a mediasoup Worker.
        await this.runMediasoupWorkers();

        // Run a protoo WebSocketServer.
        await this.runProtooWebSocketServer();

        /*
        // Log rooms status every X seconds.
        setInterval(() => {
            for (const room of rooms.values()) {
                room.logStatus();
            }
        }, 120000);
        */
    }

    /**
     * Launch as many mediasoup Workers as given in the configuration file.
     */
    async runMediasoupWorkers(): Promise<void> {
        const { numWorkers } = config.mediasoup;

        l("running %d mediasoup Workers...", numWorkers);

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

                l("mediasoup Worker resource usage [pid:%d]: %o", worker.pid, usage);
            }, 120000);
        }
    }

    getRoutes(): Router {
        const confcallRouter = Router();

        confcallRouter.get("/test", async (req: Request, res: Response) => {
            res.send(this.testString);
        });

        /**
         * For every API request, verify that the roomId in the path matches and
         * existing room.
         */
        confcallRouter.param("roomId", (reqOrig: Request, res: Response, next, roomId) => {
            // The room must exist for all API requests.

            const req: RoomRequest = reqOrig as RoomRequest;

            if (!this.rooms.has(roomId)) {
                const error: any = new Error(`room with id "${roomId}" not found`);
                error.status = 404;
                throw error;
            }

            req.room = this.rooms.get(roomId);
            next();
        });

        /**
         * API GET resource that returns the mediasoup Router RTP capabilities of
         * the room.
         */
        confcallRouter.get("/rooms/:roomId", (reqOrig: Request, res: Response) => {
            const req: RoomRequest = reqOrig as RoomRequest;

            l("1");
            const data = req.room.getRouterRtpCapabilities();
            l("2");

            res.status(200).json(data);
        });

        /**
         * POST API to create a Broadcaster.
         */
        confcallRouter.post(
            "/rooms/:roomId/broadcasters",
            async (reqOrig: Request, res: Response, next) => {
                const req: RoomRequest = reqOrig as RoomRequest;
                const { id, displayName, device, rtpCapabilities } = req.body;

                try {
                    const data = await req.room.createBroadcaster({
                        id,
                        displayName,
                        device,
                        rtpCapabilities,
                    });

                    res.status(200).json(data);
                } catch (error) {
                    next(error);
                }
            }
        );

        /**
         * DELETE API to delete a Broadcaster.
         */
        confcallRouter.delete(
            "/rooms/:roomId/broadcasters/:broadcasterId",
            (reqOrig: Request, res: Response) => {
                const req: RoomRequest = reqOrig as RoomRequest;
                const { broadcasterId } = req.params;

                req.room.deleteBroadcaster({ broadcasterId });

                res.status(200).send("broadcaster deleted");
            }
        );

        /**
         * POST API to create a mediasoup Transport associated to a Broadcaster.
         * It can be a PlainTransport or a WebRtcTransport depending on the
         * type parameters in the body. There are also additional parameters for
         * PlainTransport.
         */
        confcallRouter.post(
            "/rooms/:roomId/broadcasters/:broadcasterId/transports",
            async (reqOrig: Request, res: Response, next) => {
                const req: RoomRequest = reqOrig as RoomRequest;
                const { broadcasterId } = req.params;
                const { type, rtcpMux, comedia, sctpCapabilities } = req.body;

                try {
                    const data = await req.room.createBroadcasterTransport({
                        broadcasterId,
                        type,
                        rtcpMux,
                        comedia,
                        sctpCapabilities,
                    });

                    res.status(200).json(data);
                } catch (error) {
                    next(error);
                }
            }
        );

        /**
         * POST API to connect a Transport belonging to a Broadcaster. Not needed
         * for PlainTransport if it was created with comedia option set to true.
         */
        confcallRouter.post(
            "/rooms/:roomId/broadcasters/:broadcasterId/transports/:transportId/connect",
            async (reqOrig: Request, res: Response, next) => {
                const req: RoomRequest = reqOrig as RoomRequest;
                const { broadcasterId, transportId } = req.params;
                const { dtlsParameters } = req.body;

                try {
                    const data = await req.room.connectBroadcasterTransport({
                        broadcasterId,
                        transportId,
                        dtlsParameters,
                    });

                    res.status(200).json(data);
                } catch (error) {
                    next(error);
                }
            }
        );

        /**
         * POST API to create a mediasoup Producer associated to a Broadcaster.
         * The exact Transport in which the Producer must be created is signaled in
         * the URL path. Body parameters include kind and rtpParameters of the
         * Producer.
         */
        confcallRouter.post(
            "/rooms/:roomId/broadcasters/:broadcasterId/transports/:transportId/producers",
            async (reqOrig: Request, res: Response, next) => {
                const req: RoomRequest = reqOrig as RoomRequest;
                const { broadcasterId, transportId } = req.params;
                const { kind, rtpParameters } = req.body;

                try {
                    const data = await req.room.createBroadcasterProducer({
                        broadcasterId,
                        transportId,
                        kind,
                        rtpParameters,
                    });

                    res.status(200).json(data);
                } catch (error) {
                    next(error);
                }
            }
        );

        /**
         * POST API to create a mediasoup Consumer associated to a Broadcaster.
         * The exact Transport in which the Consumer must be created is signaled in
         * the URL path. Query parameters must include the desired producerId to
         * consume.
         */
        confcallRouter.post(
            "/rooms/:roomId/broadcasters/:broadcasterId/transports/:transportId/consume",
            async (reqOrig: Request, res: Response, next) => {
                const req: RoomRequest = reqOrig as RoomRequest;
                const { broadcasterId, transportId } = req.params;
                const { producerId } = req.query;

                try {
                    const data = await req.room.createBroadcasterConsumer({
                        broadcasterId,
                        transportId,
                        producerId,
                    });

                    res.status(200).json(data);
                } catch (error) {
                    next(error);
                }
            }
        );

        /**
         * POST API to create a mediasoup DataConsumer associated to a Broadcaster.
         * The exact Transport in which the DataConsumer must be created is signaled in
         * the URL path. Query body must include the desired producerId to
         * consume.
         */
        confcallRouter.post(
            "/rooms/:roomId/broadcasters/:broadcasterId/transports/:transportId/consume/data",
            async (reqOrig: Request, res: Response, next) => {
                const req: RoomRequest = reqOrig as RoomRequest;
                const { broadcasterId, transportId } = req.params;
                const { dataProducerId } = req.body;

                try {
                    const data = await req.room.createBroadcasterDataConsumer({
                        broadcasterId,
                        transportId,
                        dataProducerId,
                    });

                    res.status(200).json(data);
                } catch (error) {
                    next(error);
                }
            }
        );

        /**
         * POST API to create a mediasoup DataProducer associated to a Broadcaster.
         * The exact Transport in which the DataProducer must be created is signaled in
         */
        confcallRouter.post(
            "/rooms/:roomId/broadcasters/:broadcasterId/transports/:transportId/produce/data",
            async (reqOrig: Request, res: Response, next) => {
                const req: RoomRequest = reqOrig as RoomRequest;
                const { broadcasterId, transportId } = req.params;
                const { label, protocol, sctpStreamParameters, appData } = req.body;

                try {
                    const data = await req.room.createBroadcasterDataProducer({
                        broadcasterId,
                        transportId,
                        label,
                        protocol,
                        sctpStreamParameters,
                        appData,
                    });

                    res.status(200).json(data);
                } catch (error) {
                    next(error);
                }
            }
        );

        /**
         * Error handler.
         */
        confcallRouter.use((error: any, reqOrig: Request, res: Response, next: any) => {
            const req: RoomRequest = reqOrig as RoomRequest;
            if (error) {
                lw("Express app %s", String(error));
                error.status = error.status || (error.name === "TypeError" ? 400 : 500);
                res.statusMessage = error.message;
                res.status(error.status).send(String(error));
            } else {
                next();
            }
        });

        return confcallRouter;
    }

    /**
     * Create a protoo WebSocketServer to allow WebSocket connections from browsers.
     */
    async runProtooWebSocketServer() {
        l("running protoo WebSocketServer...");

        // Create the protoo WebSocket server.
        this.protooWebSocketServer = new protoo.WebSocketServer(this.server, {
            maxReceivedFrameSize: 960000, // 960 KBytes.
            maxReceivedMessageSize: 960000,
            fragmentOutgoingMessages: true,
            fragmentationThreshold: 960000,
        });

        // Handle connections from clients.
        this.protooWebSocketServer.on(
            "connectionrequest",
            (info: any, accept: any, reject: any) => {
                // The client indicates the roomId and peerId in the URL query.
                const u = url.parse(info.request.url, true);
                const roomId = u.query["roomId"];
                const peerId: string = u.query["peerId"];

                if (!roomId || !peerId) {
                    reject(400, "Connection request without roomId and/or peerId");

                    return;
                }

                l(
                    "protoo connection request [roomId:%s, peerId:%s, address:%s, origin:%s]",
                    roomId,
                    peerId,
                    info.socket.remoteAddress,
                    info.origin
                );

                // Serialize this code into the queue to avoid that two peers connecting at
                // the same time with the same roomId create two separate rooms with same
                // roomId.
                this.queue
                    .push(async () => {
                        const room: Room = await this.getOrCreateRoom({ roomId });

                        // Accept the protoo WebSocket connection.
                        const protooWebSocketTransport = accept();

                        room.handleProtooConnection({
                            peerId,
                            protooWebSocketTransport,
                        });
                    })
                    .catch((error) => {
                        le("room creation or room joining failed:%o", error);

                        reject(error);
                    });
            }
        );
    }

    /**
     * Get a Room instance (or create one if it does not exist).
     */
    async getOrCreateRoom({ roomId }: { roomId: Number }): Promise<Room> {
        let room: Room = this.rooms.get(roomId);

        // If the Room does not exist create a new one.
        if (!room) {
            l("creating a new Room [roomId:%s]", roomId);
            const mediasoupWorker = this.getMediasoupWorker();
            room = await Room.create({ mediasoupWorker, roomId });
            this.rooms.set(roomId, room);
            room.on("close", () => this.rooms.delete(roomId));
        }

        return room;
    }

    getMediasoupWorker() {
        const worker = this.mediasoupWorkers[this.nextMediasoupWorkerIdx];

        if (++this.nextMediasoupWorkerIdx === this.mediasoupWorkers.length)
            this.nextMediasoupWorkerIdx = 0;

        return worker;
    }

    async test() {}
}
