import { Router, Request, Response } from "express";

import { error as le } from "../../../components/logger";

export default (): Router => {
    const router = Router();

    router.get("/", async (req: Request, res: Response) => {
        try {
            res.send("test");
        } catch (e: any) {
            le(e);
            res.status(500).send(`Server error ${e}`);
        }
    });

    return router;
};
