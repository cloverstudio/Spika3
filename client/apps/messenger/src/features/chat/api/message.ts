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
            query: (roomId) => {
                return `/messenger/messages/roomId/${roomId}`;
            },
        }),
    }),
    overrideExisting: true,
});

export const { useGetMessagesByRoomIdQuery, useSendMessageMutation } = messageApi;
export default messageApi;
