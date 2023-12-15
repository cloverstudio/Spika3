import { API_BASE_URL } from "./config.js";

export default class MessengerAPI {
    static baseUrl = `${API_BASE_URL}/messenger`;

    static async sendMessage({ roomId, type, body }, token) {
        const [data, error] = await this.#callAPI(
            `${this.baseUrl}/messages`,
            "POST",
            { roomId, type, body },
            token
        );

        if (error) {
            throw new Error("Error sending message" + error);
        }

        const message = data.message;

        if (!message) {
            throw new Error("Error sending message, no message returned");
        }

        return message;
    }

    static async createSeenMessageRecords(roomId, token) {
        const [data, error] = await this.#callAPI(
            `${this.baseUrl}/messages/${roomId}/seen`,
            "POST",
            null,
            token
        );
        if (error) {
            throw new Error("Error sending message" + error);
        }

        const messageRecords = data.messageRecords;

        if (!messageRecords) {
            throw new Error("Error sending messageRecords, no messageRecords returned");
        }

        return messageRecords;
    }

    static async #callAPI(url, method, body, token) {
        try {
            const options = {};
            const headers = {};

            if (token) {
                headers.accesstoken = token;
            }

            if (body) {
                options.body = JSON.stringify(body);
                headers["Content-Type"] = "application/json";
            }

            if (method) {
                options.method = method;
            }

            options.headers = headers;

            const res = await fetch(url, options).then((res) => res.json());

            return this.#unpackResponse(res);
        } catch (error) {
            console.error({ error });
            return [null, `Error calling API: ${method}: ${url}, ${error}.`];
        }
    }

    static #unpackResponse(res) {
        if (res.status === "success") {
            return [res.data || {}, null];
        } else if (res.status === "error") {
            return [null, res.message];
        } else {
            return [null, "Unknown error"];
        }
    }
}
