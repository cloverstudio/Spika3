import Rooms, { RoomType } from "../../../types/Rooms";
import api from "../../../api/api";
import { store } from "../../../store/store";
import formatRoomInfo from "../../chat/lib/formatRoomInfo";

const roomApi = api.injectEndpoints({
    endpoints: (build) => ({
        getRoom: build.query<RoomType, number>({
            query: (id) => `/messenger/rooms/${id}`,
            transformResponse: (base) => {
                if (base.room) {
                    return formatRoomInfo(base.room as RoomType, store.getState().user.id);
                } else {
                    return null;
                }
            },
            providesTags: (res) => res && res?.id && [{ type: "Rooms2", id: res.id }],
        }),
        createRoom: build.mutation<{ room: RoomType }, any>({
            query: (data) => {
                return { url: "/messenger/rooms", data, method: "POST" };
            },
        }),
        muteRoom: build.mutation<{ room: RoomType }, any>({
            query: ({ roomId }) => {
                return { url: `/messenger/rooms/${roomId}/mute`, data: {}, method: "POST" };
            },
        }),
        unmuteRoom: build.mutation<{ room: RoomType }, any>({
            query: ({ roomId }) => {
                return { url: `/messenger/rooms/${roomId}/unmute`, data: {}, method: "POST" };
            },
        }),
        getRoomByUserId: build.query<{ room: RoomType }, number>({
            query: (userId) => `/messenger/rooms/users/${userId}`,
            providesTags: (res) => res && res.room?.id && [{ type: "Rooms", id: res.room.id }],
        }),
        updateRoom: build.mutation<{ room: RoomType }, { roomId: number; data: any }>({
            query: ({ roomId, data }) => {
                return { url: `/messenger/rooms/${roomId}`, method: "PUT", data };
            },
            invalidatesTags: (result, error, arg) => [{ type: "Rooms", id: arg.roomId }],
        }),
        leaveRoom: build.mutation<{ room: RoomType }, any>({
            query: ({ roomId }) => {
                return { url: `/messenger/rooms/${roomId}/leave`, data: {}, method: "POST" };
            },
        }),
        deleteRoom: build.mutation<{ room: RoomType }, any>({
            query: ({ roomId }) => {
                return { url: `/messenger/rooms/${roomId}`, method: "DELETE" };
            },
        }),
    }),
    overrideExisting: true,
});

export const {
    useGetRoomQuery,
    useCreateRoomMutation,
    useMuteRoomMutation,
    useUnmuteRoomMutation,
    useGetRoomByUserIdQuery,
    useUpdateRoomMutation,
    useDeleteRoomMutation,
    useLeaveRoomMutation,
} = roomApi;

export default roomApi;
