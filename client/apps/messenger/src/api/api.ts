import { createApi } from "@reduxjs/toolkit/query/react";
import axios, { Method } from "axios";

declare const API_BASEURL: string;
console.log({ API_BASEURL });
const axiosBaseQuery =
    ({ baseUrl } = { baseUrl: "" }) =>
    async ({ url, method, data }: { url: string; method: Method; data: any }, token: string) => {
        try {
            const result = await axios({
                url: baseUrl + url,
                method,
                data,
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            });
            console.log({ [url]: result.data });
            return { data: result.data };
        } catch (error) {
            console.error({ [url]: error });

            return {
                error,
            };
        }
    };

const rawBaseQuery = axiosBaseQuery({
    baseUrl: API_BASEURL,
});

const dynamicBaseQuery = async (args: any, api: { getState: () => any }) => {
    const token = api.getState()?.auth.token;

    const argsObj = typeof args === "string" ? { url: args } : await args;
    return rawBaseQuery(argsObj, token);
};

export default createApi({
    reducerPath: "api",
    baseQuery: dynamicBaseQuery,
    tagTypes: ["User"],

    endpoints: (builder) => ({
        getSupport: builder.query({
            query: () => "support me",
        }),
    }),
});
