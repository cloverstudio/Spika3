import { Router } from "express";

import Service, { ServiceStartParams } from "../types/serviceInterface";
import auth from "./lib/auth";
import { UserRequest } from "./lib/types";
import NotificationServer from "./notificationServer";

export default class SSEService implements Service {
    notificationServer: NotificationServer;
    async start({ rabbitMQChannel }: ServiceStartParams): Promise<void> {
        this.notificationServer = new NotificationServer(rabbitMQChannel);
    }

    getRoutes(): Router {
        const SSERouter = Router();

        SSERouter.get("/", auth, (req, res) => {
            const userReq: UserRequest = req as UserRequest;
            req.setTimeout(60 * 60 * 1000);

            const headers = {
                "Content-Type": "text/event-stream",
                Connection: "keep-alive",
                "Cache-Control": "no-cache",
            };
            res.writeHead(200, headers);

            const channelId = String(userReq.device.id);

            const connectionId = this.notificationServer.subscribe(channelId, (data) => {
                const eventData = "data: " + JSON.stringify(data) + "\n\n";

                res.write(eventData);
            });

            req.on("close", () => {
                this.notificationServer.unsubscribe(connectionId);
                res.end();
                console.log(`${channelId} Connection closed`);
            });
        });
        return SSERouter;
    }
}
