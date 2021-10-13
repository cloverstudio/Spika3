import express from "express";
import UserManagementAPIService from "./services/management";
import MessengerAPIService from "./services/messenger";
import bodyParser from "body-parser";

import l, { error as e } from "./components/logger";

const app: express.Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
  }
);

app.listen(process.env["SERVER_PORT"], () => {
  console.log(`Start on port ${process.env["SERVER_PORT"]}.`);
});

app.use(express.static("public"));


if(process.env["USE_MNG_API"]){
  const userManagementAPIService: UserManagementAPIService = new UserManagementAPIService();
  userManagementAPIService.start();
  app.use("/api/management", userManagementAPIService.getRoutes());
} 

if(process.env["USE_MSG_API"]){
  const messengerAPIService: MessengerAPIService = new MessengerAPIService();
  messengerAPIService.start();
  app.use("/api/messenger", messengerAPIService.getRoutes());
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

export default app;
