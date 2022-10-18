import QueueWorkerInterface from "../../types/queueWorkerInterface";
import { SendPushPayload } from "../../types/queuePayloadTypes";
import { warn as lw } from "../../../components/logger";
import sendFcmMessage, { FcmMessagePayload } from "../lib/sendFcmMessage";
import { PUSH_TYPE_NEW_MESSAGE } from "../../../components/consts";
import prisma from "../../../components/prisma";

class sendPushWorker implements QueueWorkerInterface {
    async run(payload: SendPushPayload) {
        try {
            if (!payload.token) {
                return lw("push sending failed: NO TOKEN");
            }
            const formattingFunction: (payload: SendPushPayload) => Promise<FcmMessagePayload> =
                getFormattingFunction(payload.type);

            const fcmMessagePayload = await formattingFunction(payload);
            await sendFcmMessage(fcmMessagePayload);
        } catch (error) {
            console.error({ pushSendError: error });
            // handle push sending failed case
            lw("push sending failed");
        }
    }
}

async function newMessageFormatter(payload: SendPushPayload) {
    const muted = await checkIfRoomIsMuted(payload);

    return {
        message: {
            token: payload.token,
            data: {
                message: JSON.stringify({
                    ...payload.data.message,
                    fromUserName: payload.data.user.displayName,
                    groupName: payload.data.groupName || "",
                    muted,
                }),
            },
        },
        muted,
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

async function checkIfRoomIsMuted(payload: SendPushPayload) {
    const roomId = payload.data.message.roomId;
    const userId = payload.data.toUserId;
    const key = `mute_${userId}_${roomId}`;

    let mutedString = await payload.redisClient.get(key);

    if (!mutedString) {
        const userSettings = await prisma.userSetting.findFirst({
            where: { userId, key: `mute_${roomId}` },
        });

        mutedString = Number(userSettings?.value === "true").toString();

        await payload.redisClient.set(key, mutedString);
    }

    return Boolean(Number(mutedString));
}

export default new sendPushWorker();
