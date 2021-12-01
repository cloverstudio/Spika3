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
};
