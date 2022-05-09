import { createApi } from "@reduxjs/toolkit/query/react";
import axios, { Method } from "axios";

declare const API_BASE_URL: string;

const axiosBaseQuery =
    ({ baseUrl } = { baseUrl: "" }) =>
    async ({ url, method, data }: { url: string; method: Method; data: any }, token: string) => {
        try {
            const result = await axios({
                url: baseUrl + url,
                method,
                data,
                headers: {
                    ...(token && { accesstoken: token }),
                },
                validateStatus: (status) => status < 500,
            });
            console.log({ [url]: result.data });

            if (result.data.status !== "success") {
                throw new Error(result.data.message);
            }

            return { data: result.data.data };
        } catch (error) {
            console.error({ [url]: error });

            throw error;
        }
    };

const rawBaseQuery = axiosBaseQuery({
    baseUrl: API_BASE_URL,
});

export const dynamicBaseQuery = async (args: any) => {
    const token = window.localStorage.getItem("access-token");

    const argsObj = typeof args === "string" ? { url: args } : await args;
    return rawBaseQuery(argsObj, token);
};

export default createApi({
    reducerPath: "api",
    baseQuery: dynamicBaseQuery,
    tagTypes: ["User", "Auth", "Contacts", "Rooms", "Device"],

    endpoints: () => ({}),
});
