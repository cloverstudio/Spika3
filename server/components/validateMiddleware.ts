import { Request, Response, NextFunction } from "express";
import { User, Device } from "@prisma/client";
import { error as le } from "./logger";
import * as yup from "yup";
import { errorResponse } from "./response";

interface UserRequest extends Request {
    user: User;
    device: Device;
    lang: string;
}

export default function validateMiddleware(schema: yup.AnySchema) {
    return async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        const userReq: UserRequest = req as UserRequest;

        try {
            const { body, query, params } = await schema.validate({
                body: req.body,
                query: req.query,
                params: req.params,
            });

            req.body = body;
            req.query = query;
            req.params = params;

            return next();
        } catch (err: any) {
            le({ validationError: err });
            return res.status(400).send(errorResponse(`Server error ${err}`, userReq.lang));
        }
    };
}
