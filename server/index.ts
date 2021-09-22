import express from "express";
import userManagementRouter from "./services/management";
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

app.listen(3000, () => {
  console.log("Start on port 3000.");
});

app.use(express.static("public"));

app.use("/api/management", userManagementRouter);

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
