import { Router, Request, Response } from "express";

import { error as le } from "../../../components/logger";
import validate from "../../../components/validateMiddleware";
import * as yup from "yup";
import { successResponse, errorResponse } from "../../../components/response";
import { UserRequest } from "../lib/types";
import { InitRouterParams } from "../../types/serviceInterface";
import axios from "axios";

const getCitiesSchema = yup.object().shape({
    query: yup.object().shape({
        country: yup.string().strict(),
        inputText: yup.string().strict(),
    }),
});

export default ({}: InitRouterParams): Router => {
    const router = Router();

    router.get("/get-cities", validate(getCitiesSchema), async (req: Request, res: Response) => {
        const userReq: UserRequest = req as UserRequest;
        const { country, inputText } = req.query;

        if (!country || !inputText) {
            return res.send(successResponse({ cities: [] }));
        }

        if (inputText.length < 3) {
            return res.send(successResponse({ cities: [] }));
        }

        try {
            const response = await axios.get(
                `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
                    inputText as string
                )},${country}&type=locality&key=${process.env.PLACES_API_KEY}`
            );

            const citiesUnique = (response.data?.results || []).map((r) => r.name);

            const cities = Array.from(new Set(citiesUnique)).map((value) => ({
                label: value,
                value,
            }));
            res.send(successResponse({ cities }));
        } catch (e: any) {
            le(e);
            res.status(500).send(errorResponse(`Server error ${e}`, userReq.lang));
        }
    });

    return router;
};
