import { Router } from "express";
import { PrismaClient } from "@prisma/client";

import Service, { ServiceStartParams } from "../types/serviceInterface";
import auth from "./lib/auth";
import { UserRequest } from "./lib/types";
import NotificationServer from "./notificationServer";
import { formatMessageBody } from "../../components/message";
import sanitize from "../../components/sanitize";
import * as Constants from "../../components/consts";

const prisma = new PrismaClient();

export default class SSEService implements Service {
    notificationServer: NotificationServer;
    async start({ rabbitMQChannel }: ServiceStartParams): Promise<void> {
        this.notificationServer = new NotificationServer(rabbitMQChannel);
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

            const undeliveredMessages = await prisma.message.findMany({
                where: {
                    deviceMessages: {
                        some: {
                            deviceId: userReq.device.id,
                        },
                    },
                    messageRecords: {
                        none: {
                            type: "delivered",
                            userId: userReq.user.id,
                        },
                    },
                },
                include: {
                    deviceMessages: true,
                },
            });

            const sanitizedUndeliveredMessages = await Promise.all(
                undeliveredMessages.map(async (message) =>
                    sanitize({
                        ...message,
                        body: await formatMessageBody(message.deviceMessages[0].body, message.type),
                    }).message()
                )
            );

            for (const message of sanitizedUndeliveredMessages) {
                const jsonData = JSON.stringify({ type: Constants.PUSH_TYPE_NEW_MESSAGE, message });

                const eventData = "data: " + jsonData + "\n\n";
                res.write(eventData);
            }

            const interval = setInterval(() => {
                res.write("data: \n\n");
            }, 5000);

            const channelId = String(userReq.device.id);

            const connectionId = this.notificationServer.subscribe(channelId, (data) => {
                const eventData = "data: " + JSON.stringify(data) + "\n\n";
                res.write(eventData);
            });
            console.log(`Device id: ${channelId} - Connection open`);

            req.on("close", () => {
                clearInterval(interval);
                this.notificationServer.unsubscribe(connectionId);
                res.end();
                console.log(`Device id: ${channelId} - Connection closed`);
            });
        });
        return SSERouter;
    }
}
