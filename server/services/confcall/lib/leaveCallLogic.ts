import amqp from "amqplib";
import { CallHistory, CallSession, User } from "@prisma/client";

import * as Constants from "../../../components/consts";
import notifyRoomUsersLogic from "./notifyRoomUsersLogic";
import sanitize from "../../../components/sanitize";
import prisma from "../../../components/prisma";

export default async function leaveCallLogic(
    userId: number,
    roomId: number,
    rabbitMQChannel?: amqp.Channel
): Promise<void> {
    // current active session
    // in the proper case it is always 1, but I treat here as multiple to avoid
    // remained active session
    const activeCalls: Array<Pick<CallHistory, "sessionId">> = await prisma.callHistory.findMany({
        where: {
            userId: userId,
            isActive: true,
        },
        select: {
            sessionId: true,
        },
    });

    const sessionIds: Array<number> = activeCalls.map((raw) => raw.sessionId);

    const sessions: Array<CallSession> = await prisma.callSession.findMany({
        where: {
            id: { in: sessionIds },
        },
    });

    //leave from all current active session
    await prisma.callHistory.updateMany({
        where: {
            userId: userId,
            isActive: true,
        },
        data: {
            isActive: false,
            leftAt: new Date(),
        },
    });

    // close session if no one exists
    await Promise.all(
        sessions.map(async (callSession) => {
            const activeUserCount = await prisma.callHistory.count({
                where: {
                    sessionId: callSession.id,
                    isActive: true,
                },
            });

            if (activeUserCount == 0) {
                await prisma.callSession.update({
                    where: {
                        id: callSession.id,
                    },
                    data: {
                        finishedAt: new Date(),
                        isActive: false,
                    },
                });
            }
        })
    );

    const user: User = await prisma.user.findFirst({
        where: {
            id: userId,
        },
    });

    rabbitMQChannel &&
        (await notifyRoomUsersLogic(roomId, rabbitMQChannel, {
            type: Constants.PUSH_TYPE_CALL_LEAVE,
            user: sanitize(user).user(),
        }));
}

export async function leaveCallLogicUser(
    userId: number,
    rabbitMQChannel?: amqp.Channel
): Promise<void> {
    const activeCallRoomId: Array<Pick<CallHistory, "roomId">> = await prisma.callHistory.findMany({
        where: {
            userId: userId,
            isActive: true,
        },
        select: {
            roomId: true,
        },
    });

    await Promise.all(
        activeCallRoomId.map(async (callHistory: CallHistory) => {
            await leaveCallLogic(userId, callHistory.roomId, rabbitMQChannel);
        })
    );
}
