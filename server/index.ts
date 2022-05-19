import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import UserManagementAPIService from "./services/management";
import MessengerAPIService from "./services/messenger";
import SMSService from "./services/sms";
import UploadService from "./services/upload";
import PushService from "./services/push";
import SSEService from "./services/sse";
import ConfcallService from "./services/confcall";
import amqp from "amqplib";
import path from "path";

import { error as e } from "./components/logger";

const app: express.Express = express();

(async () => {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // cors
    app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "*");
        res.header("Access-Control-Allow-Headers", "*");
        res.header(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization, access-token, admin-accesstoken, accesstoken, device-name, os-name, os-version, device-type, app-version"
        );

        // intercept OPTIONS method
        if ("OPTIONS" === req.method) {
            res.sendStatus(200);
        } else {
            next();
        }
    });

    const server: http.Server = app.listen(process.env["SERVER_PORT"], () => {
        console.log(`Start on port ${process.env["SERVER_PORT"]}.`);
    });

    app.use(express.static("public"));
    app.use("/uploads", express.static(process.env["UPLOAD_FOLDER"]));

    const rabbitMQConnection = await amqp.connect(
        process.env["RABBITMQ_URL"] || "amqp://localhost"
    );
    const rabbitMQChannel: amqp.Channel = await rabbitMQConnection.createChannel();

    if (process.env["USE_MNG_API"]) {
        const userManagementAPIService: UserManagementAPIService = new UserManagementAPIService();
        userManagementAPIService.start({
            rabbitMQChannel,
        });

        app.use("/api/management", userManagementAPIService.getRoutes());
    }

    if (process.env["USE_MSG_API"]) {
        const messengerAPIService: MessengerAPIService = new MessengerAPIService();
        messengerAPIService.start({
            rabbitMQChannel,
        });
        app.use("/api/messenger", messengerAPIService.getRoutes());
    }

    if (process.env["USE_SMS"]) {
        const smsService: SMSService = new SMSService();
        smsService.start({
            rabbitMQChannel,
        });
    }

    if (process.env["USE_UPLOAD"]) {
        const uploadService: UploadService = new UploadService();
        uploadService.start({
            rabbitMQChannel,
        });

        app.use("/api/upload", uploadService.getRoutes());
    }

    if (process.env["USE_PUSH"]) {
        const pushService: PushService = new PushService();
        pushService.start({
            rabbitMQChannel,
        });
    }

    if (process.env["USE_SSE"]) {
        const sseService: SSEService = new SSEService();
        sseService.start({
            rabbitMQChannel,
        });

        app.use("/api/sse", sseService.getRoutes());
    }

    if (process.env["USE_CONFCALL"]) {
        const confcallService: ConfcallService = new ConfcallService();
        confcallService.start({
            rabbitMQChannel,
            server,
        });

        app.use("/api/confcall", confcallService.getRoutes());
    }

    // test
    app.get("/api/test", (req: express.Request, res: express.Response) => {
        res.send("test");
    });

    app.all("/", (req: express.Request, res: express.Response) => {
        res.redirect("/messenger");
    });

    app.all("/messenger/*", (req: express.Request, res: express.Response) => {
        res.sendFile(path.join(__dirname, "..", "public", "messenger/index.html"));
    });

    app.all("/management/*", (req: express.Request, res: express.Response) => {
        res.sendFile(path.join(__dirname, "..", "public", "management/index.html"));
    });

    // general error
    app.use(async (err: Error, req: express.Request, res: express.Response, next: () => void) => {
        e(err);
        return res.status(500).send(`Server Error ${err.message}`);
    });
})();

export default app;
