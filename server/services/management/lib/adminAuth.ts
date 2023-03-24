import { Request, Response } from "express";

import adminTokens from "./adminTokens";
import * as constants from "../../../components/consts";

export default (req: Request, res: Response, next: () => void) => {
    if (!req.headers[constants.ADMIN_ACCESS_TOKEN])
        return res.status(403).send("Invalid access token");

    if (!adminTokens.checkToken(req.headers[constants.ADMIN_ACCESS_TOKEN] as string))
        return res.status(403).send("Invalid access token");

    next();
};
