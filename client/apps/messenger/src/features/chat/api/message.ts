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
    }),
    overrideExisting: true,
});

export const { useGetMessagesByRoomIdQuery, useSendMessageMutation } = messageApi;
export default messageApi;
