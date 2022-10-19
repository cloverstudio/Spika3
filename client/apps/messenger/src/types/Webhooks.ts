import { Webhook } from ".prisma/client";

type WebhookType = Omit<Webhook, "modifiedAt" | "createdAt"> & {
    createdAt: number;
    modifiedAt: number;
};

export default WebhookType;
