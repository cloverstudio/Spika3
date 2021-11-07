import { Request, Response, NextFunction } from "express";
import * as yup from "yup";

export default function validate(schema: yup.AnySchema) {
  return async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      await schema.validate({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (err: any) {
      return res.status(400).send(err.message);
    }
  };
}
