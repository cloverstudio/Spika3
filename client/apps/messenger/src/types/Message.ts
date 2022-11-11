import { Message, MessageRecord } from ".prisma/client";

type MessageType = Omit<Message, "createdAt" | "modifiedAt"> & {
    createdAt: number;
    modifiedAt: number;
    body: any;
    messageRecords?: MessageRecordType[];
    status?: string;
};
export type MessageRecordType = Omit<MessageRecord, "createdAt"> & {
    createdAt: number;
    roomId: number;
};

export type MessageListType = {
    list: MessageType[];
    count: number;
    limit: number;
    nextCursor?: number;
};

export type MessageRecordListType = {
    messageRecords: MessageRecordType[];
};

export default MessageType;
