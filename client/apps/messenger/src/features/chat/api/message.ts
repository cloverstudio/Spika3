import Message from "../../../types/Message";

import api from "../../../api/api";

const messageApi = api.injectEndpoints({
    endpoints: (build) => ({
        sendMessage: build.mutation({
            query: (data) => {
                return { url: "/messenger/messages", data, method: "POST" };
            },
        }),
        getMessagesByRoomId: build.query({
            query: ({ roomId, page }) => {
                return `/messenger/messages/roomId/${roomId}?page=${page}`;
            },
        }),
    }),
    overrideExisting: true,
});

export const { useGetMessagesByRoomIdQuery, useSendMessageMutation } = messageApi;
export default messageApi;
