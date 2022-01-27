import axios, { AxiosResponse } from "axios";

declare var API_BASE_URL: string;

class API {
    async post(url: string, params: any) {
        const response: AxiosResponse = await axios.post(API_BASE_URL + url, params);
        return response.data;
    }

    async get(url: string) {
        const response: AxiosResponse = await axios.get(API_BASE_URL + url);
        return response.data;
    }
}

export default new API();
