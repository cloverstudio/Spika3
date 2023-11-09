import { Room, RoomUser, User } from "@prisma/client";
import { createClient } from "redis";
import { SanitizedMessageType } from "../../components/sanitize";

export type SendSMSPayload = {
    telephoneNumber: string;
    content: string;
};

export type CreateContactPayload = {
    userId: number;
    contactId: number;
    shouldRunDeleteOldContacts: boolean;
};

export type SendPushPayload = {
    type: string;
    token: string;
    data: any;
    redisClient: ReturnType<typeof createClient>;
};

export type SendSSEPayload = {
    type: string;
    channelId: string;
    data: any;
};

export type SendMessageRecordSSEPayload = {
    types: string[];
    userId: number;
    messageIds: number[];
    pushType: string;
    reaction?: string;
    justNotify?: boolean;
};

export type CallWebhookPayload = {
    messageId: number;
    body: any;
};

export type SendMessageSSEPayload = {
    room: Room & { users: (RoomUser & { user: User })[] };
    message: SanitizedMessageType;
};
