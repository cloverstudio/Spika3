import QueueWorkerInterface from "../../types/queueWorkerInterface";
import { SendPushPayload } from "../../types/queuePayloadTypes";
import { warn as lw } from "../../../components/logger";
import sendFcmMessage, { FcmMessagePayload } from "../lib/sendFcmMessage";
import { PUSH_TYPE_NEW_MESSAGE } from "../../../components/consts";

class sendPushWorker implements QueueWorkerInterface {
    async run(payload: SendPushPayload) {
        try {
            if (!payload.token) {
                return lw("push sending failed: NO TOKEN");
            }
            const formattingFunction: (payload: SendPushPayload) => FcmMessagePayload =
                getFormattingFunction(payload.type);

            const fcmMessagePayload = formattingFunction(payload);

            await sendFcmMessage(fcmMessagePayload);
        } catch (error) {
            // handle push sending failed case
            lw("push sending failed");
        }
    }
}

function newMessageFormatter(payload: SendPushPayload) {
    return {
        message: {
            token: payload.token,
            data: JSON.stringify({
                message: payload.data.message,
                fromUserName: payload.data.user.displayName,
                ...(payload.data.groupName && { groupName: payload.data.groupName }),
            }),
        },
    };
}

function getFormattingFunction(type: string) {
    switch (type) {
        case PUSH_TYPE_NEW_MESSAGE:
            return newMessageFormatter;
        default:
            throw new Error("Unknown push type: " + type);
    }
}

export default new sendPushWorker();
