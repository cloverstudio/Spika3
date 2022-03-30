import MessageType, { MessageListType } from "../../../types/Message";

import api from "../../../api/api";

const messageApi = api.injectEndpoints({
    endpoints: (build) => ({
        sendMessage: build.mutation<{ message: MessageType }, any>({
            query: (data) => {
                return { url: "/messenger/messages", data, method: "POST" };
            },
        }),
        getMessagesByRoomId: build.query<MessageListType, { roomId: number; page: number }>({
            query: ({ roomId, page }) => {
                return `/messenger/messages/roomId/${roomId}?page=${page}`;
            },
        }),
        markRoomMessagesAsSeen: build.mutation<any, number>({
            query: (roomId) => {
                return { url: `/messenger/messages/${roomId}/seen`, method: "POST" };
            },
            invalidatesTags: (res) => res && [{ type: "Rooms", id: "HISTORY" }],
        }),
    }),
    overrideExisting: true,
});

export const {
    useGetMessagesByRoomIdQuery,
    useSendMessageMutation,
    useMarkRoomMessagesAsSeenMutation,
} = messageApi;
export default messageApi;
