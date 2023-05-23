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
import MessageRecordsSSEService from "./services/messageRecordsSse";
import ConfcallService from "./services/confcall";
import amqp from "amqplib";
import fs from "fs";
import path from "path";
import { createClient } from "redis";

import l, { error as e } from "./components/logger";
import WebhookService from "./services/webhook";
import MessagingService from "./services/messaging";
import utils from "./components/utils";

const app: express.Express = express();
const redisClient = createClient({ url: process.env.REDIS_URL });

(async () => {
    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ extended: true }));

    redisClient.on("error", (err) => {
        e("Redis Client Error", err);
    });

    await redisClient.connect();

    // cors
    app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "*");
        res.header("Access-Control-Allow-Headers", "*");
        res.header(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization, access-token, adminAccessToken, accesstoken, accessToken, device-name, os-name, os-version, device-type, app-version"
        );

        const start = process.hrtime();

        res.on("finish", () => {
            const durationInMilliseconds = utils.getDurationInMilliseconds(start);
            l(
                `${req.method} ${
                    req.originalUrl
                } [FINISHED] ${durationInMilliseconds.toLocaleString()} ms`
            );
        });

        // intercept OPTIONS method
        if ("OPTIONS" === req.method) {
            res.sendStatus(200);
        } else {
            next();
        }
    });

    const server: http.Server = app.listen(process.env["SERVER_PORT"], () => {
        l(`Start on port ${process.env["SERVER_PORT"]}.`);
    });

    // override static access only for this file
    app.get("/firebase-messaging-sw.js", (req: express.Request, res: express.Response) => {
        const pathToJS = path.join(__dirname, "../..", "public/firebase-messaging-sw.js");
        let content = fs.readFileSync(pathToJS, "utf8");

        content = content.replace("{{apiKey}}", process.env["FCM_API_KEY"]);
        content = content.replace("{{authDomain}}", process.env["FCM_AUTH_DOMAIN"]);
        content = content.replace("{{projectId}}", process.env["FCM_PROJECT_ID"]);
        content = content.replace("{{storageBucket}}", process.env["FCM_STORAGE_BUCKET"]);
        content = content.replace("{{messagingSenderId}}", process.env["FCM_SENDER_ID"]);
        content = content.replace("{{appId}}", process.env["FCM_APP_ID"]);

        res.contentType("text/javascript");
        res.send(content);
    });

    app.use(
        "/messenger/assets",
        express.static("public/messenger/assets", { maxAge: 365 * 24 * 60 * 60 * 1000 })
    );
    app.use(express.static("public", { maxAge: 5 * 60 * 1000 }));
    app.use("/uploads", express.static(process.env["UPLOAD_FOLDER"]));

    const rabbitMQConnection = await amqp.connect(
        process.env["RABBITMQ_URL"] || "amqp://localhost"
    );
    const rabbitMQChannel: amqp.Channel = await rabbitMQConnection.createChannel();

    if (+process.env["USE_MNG_API"]) {
        const userManagementAPIService: UserManagementAPIService = new UserManagementAPIService();
        userManagementAPIService.start({
            redisClient,
        });

        app.use("/api/management", userManagementAPIService.getRoutes());
    }

    if (+process.env["USE_MSG_API"]) {
        const messengerAPIService: MessengerAPIService = new MessengerAPIService();
        messengerAPIService.start({
            rabbitMQChannel,
            redisClient,
        });
        app.use("/api/messenger", messengerAPIService.getRoutes());
    }

    if (+process.env["USE_SMS"]) {
        const smsService: SMSService = new SMSService();
        smsService.start({
            rabbitMQChannel,
        });
    }

    if (+process.env["USE_UPLOAD"]) {
        const uploadService: UploadService = new UploadService();
        uploadService.start({
            rabbitMQChannel,
        });

        app.use("/api/upload", uploadService.getRoutes());
        app.use("/api/uploads", uploadService.getRoutes());
    }

    if (+process.env["USE_PUSH"]) {
        const pushService: PushService = new PushService();
        pushService.start({
            rabbitMQChannel,
            redisClient,
        });
    }

    if (+process.env["USE_SSE"]) {
        const sseService: SSEService = new SSEService();
        sseService.start({
            rabbitMQChannel,
        });

        app.use("/api/sse", sseService.getRoutes());
    }

    if (+process.env["USE_MESSAGE_RECORDS_SSE"]) {
        const messageRecordsSSE: MessageRecordsSSEService = new MessageRecordsSSEService();
        messageRecordsSSE.start({
            rabbitMQChannel,
        });
    }

    if (+process.env["USE_WEBHOOK"]) {
        const webhook: WebhookService = new WebhookService();
        webhook.start({
            rabbitMQChannel,
        });
    }

    if (+process.env["USE_MESSAGING"]) {
        const messaging: MessagingService = new MessagingService();
        messaging.start({
            rabbitMQChannel,
            redisClient,
        });

        app.use("/api/messaging", messaging.getRoutes());
    }

    if (+process.env["USE_CONFCALL"]) {
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
        res.redirect("/messenger/app");
    });

    app.all("/messenger/*", (req: express.Request, res: express.Response) => {
        res.sendFile(path.join(__dirname, "../..", "public/messenger/index.html"));
    });

    app.all("/management/*", (req: express.Request, res: express.Response) => {
        res.sendFile(path.join(__dirname, "../..", "public/management/index.html"));
    });

    // general error
    app.use(async (err: Error, req: express.Request, res: express.Response, next: () => void) => {
        e(err);
        return res.status(500).send(`Server Error ${err.message}`);
    });
})();

export default app;
