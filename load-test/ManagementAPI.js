import { API_BASE_URL } from "./config.js";

export default class ManagementAPI {
    baseUrl = `${API_BASE_URL}/management`;
    adminToken = null;

    async init(username, password) {
        this.adminToken = await this.#getAdminToken(username, password);
    }

    async #getAdminToken(username, password) {
        const [data, error] = await this.#callAPI(`${this.baseUrl}/auth`, "POST", {
            username,
            password,
        });

        if (error) {
            throw new Error("Error logging in as admin", { error });
        }

        const token = data.token;

        if (!token) {
            throw new Error("Error logging in as admin, no token received");
        }

        return token;
    }

    async createUser(data) {
        const [createUserData, createUserError] = await this.#callAPI(
            `${this.baseUrl}/users`,
            "POST",
            data,
        );
        if (createUserError && createUserError !== "Phone number is already in use") {
            throw Error("Error creating user", { createUserError });
        }

        if (createUserData?.user) {
            return createUserData.user;
        }

        const [userData, userError] = await this.#callAPI(
            `${this.baseUrl}/users/telephoneNumber/${data.telephoneNumber}`,
            "GET",
        );

        if (userData.user) {
            return userData.user;
        }

        throw Error("Error fetching user", { userError });
    }

    async createRoom(roomData) {
        const [data, error] = await this.#callAPI(`${this.baseUrl}/groups`, "POST", roomData);

        if (error) {
            throw new Error("Error creating room", { error });
        }

        const roomId = data.group?.id;

        if (!roomId) {
            throw new Error("Error creating room, no room id received");
        }

        return roomId;
    }

    async addUsersToRoom(userIds, roomId) {
        const [data, error] = await this.#callAPI(`${this.baseUrl}/groups/${roomId}/add`, "PUT", {
            userIds,
        });

        if (error) {
            throw new Error("Error adding users to room " + error);
        }

        const added = data.added;

        if (!added) {
            throw new Error("Error adding users to room, no added received");
        }

        return added;
    }

    async getActiveUserDevice(userId) {
        const [data, error] = await this.#callAPI(`${this.baseUrl}/users/${userId}/devices`, "GET");

        if (error) {
            throw new Error("Error getting user devices", { error });
        }

        const devices = data.devices;

        if (!devices) {
            throw new Error("Error getting user devices, no devices received");
        }

        return devices.find((device) => device.token && device.tokenExpiredAt > +new Date());
    }

    async createUserDevice(userId, deviceId) {
        const [data, error] = await this.#callAPI(
            `${this.baseUrl}/users/${userId}/devices`,
            "POST",
            { deviceId },
        );

        if (error) {
            throw new Error("Error creating user device " + error);
        }

        const device = data.device;

        if (!device) {
            throw new Error("Error creating user device, no device received");
        }

        return device;
    }

    async #callAPI(url, method, body) {
        try {
            const options = {};
            const headers = {};

            if (this.adminToken) {
                headers.adminaccesstoken = this.adminToken;
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

    #unpackResponse(res) {
        if (res.status === "success") {
            return [res.data || {}, null];
        } else if (res.status === "error") {
            return [null, res.message];
        } else {
            return [null, "Unknown error"];
        }
    }
}
