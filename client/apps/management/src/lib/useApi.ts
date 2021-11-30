import axios, { AxiosResponse } from "axios";
import { useSelector, useDispatch } from "react-redux";

import { RootState } from "../store/store";

declare var API_BASEURL: string;

type CallbackFunction = (data: any) => void;

axios.defaults.validateStatus = (status) => status >= 200 && status < 500;

export function usePost() {
    const accessToken = useSelector((state: RootState) => state.auth.token);

    return async (url: string, params: any) => {
        const response: AxiosResponse<any> = await axios({
            method: "post",
            url: API_BASEURL + url,
            data: params,
            headers: {
                "admin-accesstoken": accessToken,
            },
        });
        if (response.data.status === "fail") {
            throw Error(response.data.message);
        }
        return response.data;
    };
}

export function useGet() {
    const accessToken = useSelector((state: RootState) => state.auth.token);

    return async (url: string) => {
        const response: AxiosResponse<any> = await axios({
            method: "get",
            url: API_BASEURL + url,
            headers: {
                "admin-accesstoken": accessToken,
            },
        });
        if (response.data.status === "fail") {
            throw Error(response.data.message);
        }

        return response.data;
    };
}

export function usePut() {
    const accessToken = useSelector((state: RootState) => state.auth.token);

    return async (url: string, params: any) => {
        const response: AxiosResponse<any> = await axios({
            method: "put",
            url: API_BASEURL + url,
            data: params,
            headers: {
                "admin-accesstoken": accessToken,
            },
        });

        if (response.data.status === "fail") {
            throw Error(response.data.message);
        }
        return response.data;
    };
}

export function useDelete() {
    const accessToken = useSelector((state: RootState) => state.auth.token);

    return async (url: string) => {
        const response: AxiosResponse<any> = await axios({
            method: "delete",
            url: API_BASEURL + url,
            headers: {
                "admin-accesstoken": accessToken,
            },
        });
        if (response.data.status === "fail") {
            throw Error(response.data.message);
        }
        return response.data;
    };
}
