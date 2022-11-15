import QueueWorkerInterface from "../../types/queueWorkerInterface";
import { CallWebhookPayload } from "../../types/queuePayloadTypes";
import { error as le } from "../../../components/logger";
import axios from "axios";
import { formatMessageBody } from "../../../components/message";
import sanitize from "../../../components/sanitize";
import prisma from "../../../components/prisma";

class CallWebhookWorker implements QueueWorkerInterface {
    async run({ messageId, body }: CallWebhookPayload) {
        try {
            const message = await prisma.message.findUnique({ where: { id: messageId } });

            if (!message) {
                return;
            }

            const formattedBody = await formatMessageBody(body, message.type, true);
            const sanitizedMessage = sanitize({ ...message, body: formattedBody }).message();
            const fromUser = await prisma.user.findUnique({
                where: { id: message.fromUserId },
                select: { displayName: true, avatarUrl: true },
            });

            if (fromUser && fromUser.avatarUrl) {
                fromUser.avatarUrl = `${process.env.UPLOADS_BASE_URL}${fromUser.avatarUrl}`;
            }
            const room = await prisma.room.findUnique({
                where: { id: message.roomId },
                select: { name: true, avatarUrl: true },
            });
            if (room && room.avatarUrl) {
                room.avatarUrl = `${process.env.UPLOADS_BASE_URL}${room.avatarUrl}`;
            }

            const webhook = await prisma.webhook.findFirst({ where: { roomId: message.roomId } });

            if (webhook) {
                try {
                    axios.post(webhook.url, {
                        data: { message: sanitizedMessage, fromUser, room },
                        headers: {
                            "Content-Type": "application/json",
                            "Verification-Signature": webhook.verifySignature,
                        },
                    }).catch((e)=> {
                        le({ webHookError: e });
                    });
                } catch (error) {
                    le({ webHookError: error });
                }
            }
        } catch (error) {
            console.error({ CallWebhookWorkerError: error });
            le({ CallWebhookWorkerError: error });
        }
    }
}

export default new CallWebhookWorker();
