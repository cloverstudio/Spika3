import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import amqp from "amqplib";
import Service, { ServiceStartParams } from "../types/serviceInterface";
import auth from "./lib/auth";
import { UserRequest } from "./lib/types";
import NotificationServer from "./notificationServer";
import { formatMessageBody } from "../../components/message";
import sanitize from "../../components/sanitize";
import * as Constants from "../../components/consts";
import { leaveCallLogicUser } from "../,,/../confcall/lib/leaveCallLogic";

const prisma = new PrismaClient();

export default class SSEService implements Service {
    notificationServer: NotificationServer;
    rabbitMQChannel: amqp.Channel;

    async start({ rabbitMQChannel }: ServiceStartParams): Promise<void> {
        this.notificationServer = new NotificationServer(rabbitMQChannel);
        this.rabbitMQChannel = rabbitMQChannel;
    }

    getRoutes(): Router {
        const SSERouter = Router();

        SSERouter.get("/", auth, async (req, res) => {
            const userReq: UserRequest = req as UserRequest;
            req.setTimeout(24 * 60 * 60 * 1000);

            const headers = {
                "Content-Type": "text/event-stream",
                Connection: "keep-alive",
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
            };
            res.writeHead(200, headers);
            res.write("data: \n\n");

            const interval = setInterval(() => {
                res.write("data: \n\n");
            }, 5000);

            const channelId = String(userReq.device.id);

            const connectionId = this.notificationServer.subscribe(channelId, (data) => {
                console.log(`Device id: ${channelId} - Event - ${data.type}`);

                const eventData = "data: " + JSON.stringify(data) + "\n\n";
                res.write(eventData);
            });
            console.log(`Device id: ${channelId} - Connection open`);

            req.on("close", async () => {
                clearInterval(interval);
                this.notificationServer.unsubscribe(connectionId);
                res.end();
                console.log(`Device id: ${channelId} - Connection closed`);

                await leaveCallLogicUser(userReq.user.id, this.rabbitMQChannel);
            });
        });
        return SSERouter;
    }
}
