import { Request, Response, RequestHandler } from "express";

import { UserRequest } from "../../lib/types";
import { error as le } from "../../../../components/logger";

import auth from "../../lib/auth";

import { successResponse, errorResponse } from "../../../../components/response";

import { getLinkThumbnailData } from "../../../../components/message";

export default (): RequestHandler[] => {
    return [
        auth,
        async (req: Request, res: Response) => {
            const userReq: UserRequest = req as UserRequest;

            const url = req.query.url as string;

            try {
                const thumbnailData = await getLinkThumbnailData(url);

                if (!thumbnailData) {
                    return res.status(404).send(errorResponse("No thumbnail found"));
                }

                return res.status(200).send(successResponse(thumbnailData, userReq.lang));
            } catch (e: unknown) {
                le(e);
                res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
            }
        },
    ];
};
