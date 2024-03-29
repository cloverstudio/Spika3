import MessageType, { MessageRecordListType, MessageRecordType } from "../../../types/Message";

import api from "../../../api/api";

const messageApi = api.injectEndpoints({
    endpoints: (build) => ({
        sendMessage: build.mutation<{ message: MessageType }, any>({
            query: (data) => {
                return { url: "/messenger/messages", data, method: "POST" };
            },
        }),
        markRoomMessagesAsSeen: build.mutation<any, number>({
            query: (roomId) => {
                return { url: `/messenger/messages/${roomId}/seen`, method: "POST" };
            },
            invalidatesTags: (res) => res && [{ type: "Rooms", id: "HISTORY" }],
        }),
        getMessageRecordsById: build.query<MessageRecordListType, number>({
            query: (messageId) => {
                return `/messenger/messages/${messageId}/message-records`;
            },
            providesTags: (res, _, messageId) =>
                res && res.messageRecords?.length && [{ type: "MessageRecords", id: messageId }],
        }),
        deleteMessage: build.mutation<any, { id: number; target: "all" | "user" }>({
            query: ({ id, target }) => {
                return { url: `/messenger/messages/${id}?target=${target}`, method: "DELETE" };
            },
            invalidatesTags: (res) => res && [{ type: "Rooms", id: "HISTORY" }],
        }),
        editMessage: build.mutation<any, { id: number; text: string }>({
            query: ({ id, text }) => {
                return { url: `/messenger/messages/${id}`, method: "PUT", data: { text } };
            },
            invalidatesTags: (res) => res && [{ type: "Rooms", id: "HISTORY" }],
        }),
        createReaction: build.mutation<
            { messageRecord: MessageRecordType },
            { messageId: number; reaction: string }
        >({
            query: ({ messageId, reaction }) => {
                return {
                    url: "/messenger/message-records",
                    method: "POST",
                    data: { messageId, reaction, type: "reaction" },
                };
            },
            invalidatesTags: (res) =>
                res &&
                res.messageRecord && [{ type: "MessageRecords", id: res.messageRecord.messageId }],
        }),
    }),
    overrideExisting: true,
});

export const {
    useSendMessageMutation,
    useMarkRoomMessagesAsSeenMutation,
    useGetMessageRecordsByIdQuery,
    useDeleteMessageMutation,
    useEditMessageMutation,
    useCreateReactionMutation,
} = messageApi;
export default messageApi;
