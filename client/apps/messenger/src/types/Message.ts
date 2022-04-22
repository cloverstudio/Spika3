import { Message, MessageRecord } from ".prisma/client";

type MessageType = Omit<Message, "createdAt"> & { createdAt: number; body: any };
export type MessageRecordType = Omit<MessageRecord, "createdAt"> & { createdAt: number };

export type MessageListType = {
    list: MessageType[];
    count: number;
    limit: number;
};

export type MessageRecordListType = {
    messageRecords: MessageRecordType[];
};

export default MessageType;
