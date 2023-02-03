import axios, { AxiosResponse } from "axios";
import { google } from "googleapis";

import l, { error as le } from "../../../components/logger";

const PATH = "/v1/projects/" + process.env.FCM_PROJECT_ID + "/messages:send";
const MESSAGING_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";
const SCOPES = [MESSAGING_SCOPE];

let accessToken = null;
let accessTokenExpiryMS = null;

function getAccessToken() {
    return new Promise(function (resolve, reject) {
        const jwtClient = new google.auth.JWT(
            process.env.FCM_EMAIL,
            null,
            process.env.FCM_PRIVATE_KEY,
            SCOPES,
            null
        );

        jwtClient.authorize(function (err, tokens) {
            if (err) {
                reject(err);
                return;
            }
            accessToken = tokens.access_token;
            accessTokenExpiryMS = tokens.expiry_date;

            resolve(true);
        });
    });
}

export type FcmMessagePayload = {
    message: {
        token: string;
        data?: any;
    };
    muted: boolean;
};

export default async function sendFcmMessage(fcmMessage: FcmMessagePayload): Promise<any> {
    if (process.env.IS_TEST === "1") {
        return;
    }

    if (!accessToken || +new Date() > accessTokenExpiryMS - 1000) {
        await getAccessToken();
    }

    const message = JSON.parse(fcmMessage.message.data.message);

    const muted = fcmMessage.muted;
    const apns = {
        payload: {
            aps: {
                [muted ? "content-available" : "mutable-content"]: 1,
                ...(!muted && {
                    alert: {
                        title: "New message",
                    },
                    "thread-id": message.roomId.toString(),
                }),
            },
        },
    };

    const android = {
        priority: "HIGH",
    };

    const webpush = {
        headers: {
            Topic: message.roomId.toString(),
        },
    };

    const data = {
        message: {
            ...fcmMessage.message,
            apns,
            android,
            webpush,
        },
    };

    const response: AxiosResponse<any> = await axios({
        method: "post",
        url: "https://" + process.env.FCM_HOST + PATH,
        data,
        headers: {
            Authorization: "Bearer " + accessToken,
        },
        validateStatus: (status) => status < 500,
    });

    if (response.status !== 200) {
        le(`FCM ERROR, ${JSON.stringify({ data, resData: response.data }, null, 4)}`);
        throw new Error("FCM error");
    }

    return response.data;
}
