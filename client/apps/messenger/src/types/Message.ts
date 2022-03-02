import { Message } from ".prisma/client";

type MessageType = Omit<Message, "createdAt"> & { createdAt: number; messageBody: any };

export type MessageListType = {
    list: MessageType[];
    count: number;
    limit: number;
};

export default MessageType;
