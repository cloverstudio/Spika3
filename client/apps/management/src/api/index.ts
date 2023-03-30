import axios, { Method } from "axios";
import { createApi } from "@reduxjs/toolkit/query/react";
import { showSnackBar } from "@/store/modalSlice";
import * as Constants from "@lib/constants";

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
                ...(token && { adminAccessToken: token }),
            };

            const result = await axios({
                url: baseUrl + url,
                method,
                data,
                headers: additionalHeaders,
                validateStatus: (status) => status < 500,
            });

            if (result.status === 401) {
                if (dispatch) {
                    dispatch({ type: "USER_LOGOUT" });
                }

                window.localStorage.removeItem(Constants.ADMIN_ACCESS_TOKEN);
                window.location.href = "/management/login?logout=force";
                return;
            }

            if (result.status === 403) {
                if (dispatch) {
                    dispatch({ type: "USER_LOGOUT" });
                }

                return {
                    data: {
                        status: "error",
                        message:
                            "You don't have permission to perform this action, please login again",
                    },
                };
            }

            return result;
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
    const token = window.localStorage.getItem(Constants.ADMIN_ACCESS_TOKEN);

    const argsObj = typeof args === "string" ? { url: args } : await args;
    return rawBaseQuery(argsObj, token, options?.dispatch);
};

export default createApi({
    reducerPath: "api",
    baseQuery: dynamicBaseQuery,
    tagTypes: ["Auth", "Users", "Groups", "Devices"],

    endpoints: () => ({}),
});

export type SuccessResponse<Data> = {
    status: "success";
    data: Data;
};

export type ErrorResponse = {
    status: "error";
    message: string;
};
