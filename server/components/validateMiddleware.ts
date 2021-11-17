import { Request, Response, NextFunction } from "express";
import { error as le } from "./logger";
import * as yup from "yup";

export default function validateMiddleware(schema: yup.AnySchema) {
    return async (req: Request, res: Response, next: NextFunction): Promise<any> => {
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
            return res.status(400).send(err.message);
        }
    };
}
