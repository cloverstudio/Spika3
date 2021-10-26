import dotenv from 'dotenv';
const result = dotenv.config();
console.log(result.parsed);

import express from "express";
import UserManagementAPIService from "./services/management";
import MessengerAPIService from "./services/messenger";
import SMSService from "./services/sms";
import bodyParser from "body-parser";
import amqp from 'amqplib';

import l, { error as e } from "./components/logger"

const app: express.Express = express();

(async () => {

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));


  // cors
  app.use(
    (req: express.Request, res: express.Response, next: express.NextFunction) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "*");
      res.header("Access-Control-Allow-Headers", "*");
      res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, access-token, admin-accesstoken'
      )

      // intercept OPTIONS method
      if ('OPTIONS' === req.method) {
        res.send(200)
      } else {
        next()
      }

    }
  );

  app.listen(process.env["SERVER_PORT"], () => {
    console.log(`Start on port ${process.env["SERVER_PORT"]}.`);
  });

  app.use(express.static("public"));

  const rabbitMQConnetion = await amqp.connect(process.env["RABBITMQ_URL"] || "amqp://localhost");
  const rabbitMQChannel: amqp.Channel = await rabbitMQConnetion.createChannel();

  if (process.env["USE_MNG_API"]) {
    const userManagementAPIService: UserManagementAPIService = new UserManagementAPIService();
    userManagementAPIService.start({
      rabbitMQChannel
    });

    app.use("/api/management", userManagementAPIService.getRoutes());
  }

  if (process.env["USE_MSG_API"]) {
    const messengerAPIService: MessengerAPIService = new MessengerAPIService();
    messengerAPIService.start({
      rabbitMQChannel
    });
    app.use("/api/messenger", messengerAPIService.getRoutes());
  }

  if (process.env["USE_SMS"]) {
    const smsService: SMSService = new SMSService();
    smsService.start({
      rabbitMQChannel
    });
  }

  // test
  app.get("/api/test", (req: express.Request, res: express.Response) => {
    res.send("test");
  });

  // general error
  app.use(
    async (
      err: Error,
      req: express.Request,
      res: express.Response,
      next: Function
    ) => {
      e(err);
      return res.status(500).send(`Server Error ${err.message}`);
    }
  );

})()


export default app;