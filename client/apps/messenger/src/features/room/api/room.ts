import Rooms, { RoomType } from "../../../types/Rooms";
import api from "../../../api/api";
import { store } from "../../../store/store";
import formatRoomInfo from "../../chat/lib/formatRoomInfo";

const roomApi = api.injectEndpoints({
    endpoints: (build) => ({
        getRoom2: build.query<RoomType, number>({
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
        createRoom2: build.mutation<{ room: RoomType }, any>({
            query: (data) => {
                return { url: "/messenger/rooms", data, method: "POST" };
            },
        }),
    }),
    overrideExisting: true,
});

export const { useGetRoom2Query, useCreateRoom2Mutation } = roomApi;

export default roomApi;
