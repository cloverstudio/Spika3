import axios, { AxiosResponse } from "axios";
import { google } from "googleapis";

import l, { error as le } from "../../../components/logger";

const PATH = "/v1/projects/" + process.env.FCM_PROJECT_ID + "/messages:send";
const MESSAGING_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";
const SCOPES = [MESSAGING_SCOPE];

let accessToken = null;

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
            resolve(tokens.access_token);
        });
    });
}

export type FcmMessagePayload = {
    message: {
        token: string;
        //notification: {
        //    title: string;
        //    body: string;
        //};
        data?: any;
    };
};

export default async function sendFcmMessage(fcmMessage: FcmMessagePayload): Promise<any> {
    if (process.env.IS_TEST === "1") {
        return;
    }

    if (!accessToken) accessToken = await getAccessToken();

    const response: AxiosResponse<any> = await axios({
        method: "post",
        url: "https://" + process.env.FCM_HOST + PATH,
        data: {
            message: {
                ...fcmMessage.message,
                apns: {
                    payload: {
                        aps: {
                            "mutable-content": 1,
                        },
                    },
                },
            },
        },
        headers: {
            Authorization: "Bearer " + accessToken,
        },
        validateStatus: (status) => status < 500,
    });

    if (response.status !== 200) {
        le("FCM error");
        throw new Error("FCM error");
    } else {
        l("FCM sent");
    }

    return response.data;
}
