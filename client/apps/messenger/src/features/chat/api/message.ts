import MessageType, { MessageRecordListType } from "../../../types/Message";

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
        }),
        deleteMessage: build.mutation<any, { id: number; target: "all" | "user" }>({
            query: ({ id, target }) => {
                return { url: `/messenger/messages/${id}?target=${target}`, method: "DELETE" };
            },
            invalidatesTags: (res) => res && [{ type: "Rooms", id: "HISTORY" }],
        }),
    }),
    overrideExisting: true,
});

export const {
    useSendMessageMutation,
    useMarkRoomMessagesAsSeenMutation,
    useGetMessageRecordsByIdQuery,
    useDeleteMessageMutation,
} = messageApi;
export default messageApi;
