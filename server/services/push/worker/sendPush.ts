import QueueWorkerInterface from "../../types/queueWorkerInterface";
import { SendPushPayload } from "../../types/queuePayloadTypes";
import { warn as lw, error as le } from "../../../components/logger";
import sendFcmMessage, { FcmMessagePayload } from "../lib/sendFcmMessage";
import { PUSH_TYPE_NEW_MESSAGE } from "../../../components/consts";
import prisma from "../../../components/prisma";
import { getRoomUnreadCount } from "../../messenger/route/room";

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
            le({ pushSendError: error });
        }
    }
}

async function newMessageFormatter(payload: SendPushPayload) {
    const userId = payload.data.toUserId as number;
    const { message, user, groupName = "", roomAvatarFileId, roomUserCreatedAt } = payload.data;
    const roomId = message.roomId as number;
    const redisClient = payload.redisClient;

    const muted = await checkIfRoomIsMuted({
        roomId,
        userId,
        redisClient,
    });

    const unreadCount = await getRoomUnreadCount({
        roomId,
        userId,
        redisClient,
        roomUserCreatedAt,
    });

    return {
        message,
        token: payload.token,
        muted,
        fromUserName: user.displayName,
        groupName: groupName || "",
        unreadCount,
        roomAvatarFileId,
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

async function checkIfRoomIsMuted({
    roomId,
    userId,
    redisClient,
}: {
    roomId: number;
    userId: number;
    redisClient: any;
}) {
    const key = `mute_${userId}_${roomId}`;

    let mutedString = await redisClient.get(key);

    if (!mutedString) {
        const userSettings = await prisma.userSetting.findFirst({
            where: { userId, key: `mute_${roomId}` },
        });

        mutedString = Number(userSettings?.value === "true").toString();

        await redisClient.set(key, mutedString);
    }

    return Boolean(Number(mutedString));
}

export default new sendPushWorker();
