import { createClient } from "redis";

export type SendSMSPayload = {
    telephoneNumber: string;
    content: string;
};

export type CreateContactPayload = {
    userId: number;
    contactId: number;
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
