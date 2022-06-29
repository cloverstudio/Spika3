import express, { Router, Request, Response } from "express";
import amqp from "amqplib";
import * as mediasoup from "mediasoup";
import { PrismaClient, RoomUser, Room, User } from "@prisma/client";
const prisma = new PrismaClient();

import Service, { ServiceStartParams } from "../types/serviceInterface";
import l, { error as le, warn as lw } from "../../components/logger";
import { UserRequest } from "../messenger/lib/types";
import auth from "../messenger/lib/auth";
import config from "./config";
import { successResponse, errorResponse } from "../../components/response";
import sanitize from "../../components/sanitize";
import * as Constants from "../../components/consts";

export default class ConfcallService implements Service {
    mediasoupWorkers: Array<mediasoup.types.Worker> = [];
    rabbitMQChannel: amqp.Channel = null;

    async start({ rabbitMQChannel, server }: ServiceStartParams): Promise<void> {
        const { numWorkers } = config.mediasoup;
        this.rabbitMQChannel = rabbitMQChannel;

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

                //l("mediasoup Worker resource usage [pid:%d]: %o", worker.pid, usage);
            }, 120000);
        }
    }

    async notifyUsers(roomId: number, data: any): Promise<void> {
        // get device list which belongs to the room
        const userIds = await prisma.roomUser.findMany({
            where: {
                roomId,
            },
            select: {
                userId: true,
            },
        });

        const deviceIds = await prisma.device.findMany({
            where: {
                userId: { in: userIds.map((obj) => obj.userId) },
            },
            select: {
                id: true,
            },
        });

        deviceIds.forEach((obj) => {
            const deviceId = obj.id;

            this.rabbitMQChannel.sendToQueue(
                Constants.QUEUE_SSE,
                Buffer.from(
                    JSON.stringify({
                        channelId: deviceId,
                        data,
                    })
                )
            );
        });
    }
    getRoutes(): Router {
        const router = Router();

        router.post("/:roomId/join", auth, async (req: Request, res: Response) => {
            const userReq: UserRequest = req as UserRequest;
            const roomId = parseInt((req.params.roomId as string) || "");

            await this.notifyUsers(roomId, {
                type: Constants.PUSH_TYPE_CALL_JOIN,
                user: sanitize(userReq.user).user(),
            });

            try {
                res.send(successResponse({}));
            } catch (e: any) {
                le(e);
                res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
            }
        });

        router.post("/:roomId/leave", auth, async (req: Request, res: Response) => {
            const userReq: UserRequest = req as UserRequest;
            const roomId = parseInt((req.params.roomId as string) || "");

            await this.notifyUsers(roomId, {
                type: Constants.PUSH_TYPE_CALL_LEAVE,
                user: sanitize(userReq.user).user(),
            });

            try {
                res.send(successResponse({}));
            } catch (e: any) {
                le(e);
                res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
            }
        });

        return router;
    }

    async test() {}
}
