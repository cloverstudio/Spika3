import dotenv from "dotenv";
const result = dotenv.config();

import express from "express";
import UserManagementAPIService from "./services/management";
import MessengerAPIService from "./services/messenger";
import SMSService from "./services/sms";
import UploadService from "./services/upload";
import bodyParser from "body-parser";
import amqp from "amqplib";
import spdy from "spdy";
import fs from "fs";

import l, { error as e } from "./components/logger";

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
            "Content-Type, Authorization, access-token, admin-accesstoken"
        );

        // intercept OPTIONS method
        if ("OPTIONS" === req.method) {
            res.send(200);
        } else {
            next();
        }
    });

    const options: any = {};

    if (process.env["HTTP2_SELFSIGNCERTIFICATE"]) {
        options.key = fs.readFileSync(__dirname + "/certificates/privateKey.key");
        options.cert = fs.readFileSync(__dirname + "/certificates/certificate.crt");
    }

    app.use(express.static("public"));

    const rabbitMQConnetion = await amqp.connect(process.env["RABBITMQ_URL"] || "amqp://localhost");
    const rabbitMQChannel: amqp.Channel = await rabbitMQConnetion.createChannel();

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

    // test
    app.get("/api/test", (req: express.Request, res: express.Response) => {
        res.send("test");
    });

    // general error
    app.use(async (err: Error, req: express.Request, res: express.Response, next: Function) => {
        e(err);
        return res.status(500).send(`Server Error ${err.message}`);
    });

    spdy.createServer(options, app).listen(process.env["SERVER_PORT"], () => {
        console.log(`HTTP/2 server listening on port: ${process.env["SERVER_PORT"]}`);
    });
})();

export default app;
