import { createApi } from "@reduxjs/toolkit/query/react";
import axios, { Method } from "axios";
import { showSnackBar } from "../store/modalSlice";
import platform from "platform";
import * as constants from "../../../../lib/constants";

declare const API_BASE_URL: string;

const axiosBaseQuery =
    ({ baseUrl } = { baseUrl: "" }) =>
    async (
        { url, method, data }: { url: string; method: Method; data: any },
        token: string,
        dispatch?: any
    ) => {
        try {
            const additionalHeaders: any = {
                ...(token && { accesstoken: token }),
            };

            additionalHeaders["device-type"] = platform.name;
            additionalHeaders["os-name"] = platform.name;
            additionalHeaders["os-version"] = platform.version;
            additionalHeaders["device-name"] = platform.description;
            additionalHeaders["app-version"] = constants.APP_VERSION;
            additionalHeaders["device-type"] = constants.DEVICE_TYPE;

            const result = await axios({
                url: baseUrl + url,
                method,
                data,
                headers: additionalHeaders,
                validateStatus: (status) => status < 500,
            });

            if (result.status === 401 && url !== "/messenger/me") {
                if (dispatch) {
                    dispatch({ type: "USER_LOGOUT" });
                }

                window.localStorage.removeItem(constants.LSKEY_ACCESSTOKEN);
                window.location.href = "/messenger/?logout=force";
                return;
            }

            if (result.data.status !== "success") {
                throw new Error(result.data.message);
            }

            return { data: result.data.data };
        } catch (error) {
            console.error({ [url]: error });
            const text = (error as any)?.message || "Unexpected server error";
            if (dispatch) {
                dispatch(
                    showSnackBar({
                        severity: "error",
                        text,
                    })
                );
            }
            throw error;
        }
    };

const rawBaseQuery = axiosBaseQuery({
    baseUrl: API_BASE_URL,
});

export const dynamicBaseQuery = async (args: any, options?: { dispatch: any }) => {
    const token = window.localStorage.getItem(constants.LSKEY_ACCESSTOKEN);

    const argsObj = typeof args === "string" ? { url: args } : await args;
    return rawBaseQuery(argsObj, token, options?.dispatch);
};

export default createApi({
    reducerPath: "api",
    baseQuery: dynamicBaseQuery,
    tagTypes: [
        "User",
        "Auth",
        "Contacts",
        "Rooms",
        "Device",
        "Notes",
        "MessageRecords",
        "Webhooks",
        "ApiKeys",
        "BlockList",
    ],

    endpoints: () => ({}),
});
