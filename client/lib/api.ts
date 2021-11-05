import axios, { AxiosResponse } from "axios";

declare var API_BASEURL: string;

class API {
  async post(url: string, params: any) {
    const response: AxiosResponse = await axios.post(API_BASEURL + url, params);
    return response.data;
  }

  async get(url: string) {
    const response: AxiosResponse = await axios.get(API_BASEURL + url);
    return response.data;
  }

}

export default new API();
