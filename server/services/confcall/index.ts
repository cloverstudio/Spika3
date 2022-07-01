import express, { Router, Request, Response } from "express";
import amqp from "amqplib";
import * as mediasoup from "mediasoup";
import { PrismaClient, CallHistory, CallSession } from "@prisma/client";
const prisma = new PrismaClient();

import joinRouter from "./route/join";
import participantsRouter from "./route/participants";
import Service, { ServiceStartParams } from "../types/serviceInterface";
import l, { error as le, warn as lw } from "../../components/logger";
import config from "./config";

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

    getRoutes(): Router {
        const router = Router();
        router.use("/", joinRouter({ rabbitMQChannel: this.rabbitMQChannel }));
        router.use("/participants", participantsRouter({ rabbitMQChannel: this.rabbitMQChannel }));

        return router;
    }

    async test() {}
}
