import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { dynamicBaseQuery } from "../../../api/api";
import type { RootState } from "../../../store/store";
import MessageType from "../../../types/Message";
import { RoomType } from "../../../types/Rooms";
import UserType from "../../../types/User";
import formatRoomInfo from "../lib/formatRoomInfo";

export const fetchHistory = createAsyncThunk(
    "room/fetchHistory",
    async (args: { page: number; keyword: string }, thunkAPI) => {
        const fromUserId = (
            (thunkAPI.getState() as RootState).api.queries["getUser(undefined)"].data as {
                user: UserType;
            }
        ).user.id;

        const response = await dynamicBaseQuery(
            `/messenger/history?page=${args.page}&keyword=${args.keyword}`
        );

        const list = response.data.list.map((room) => formatRoomInfo(room, fromUserId));

        return {
            data: { ...response.data, list },
            keyword: args.keyword,
            page: args.page,
        };
    }
);

type HistoryState = {
    list: (RoomType & { lastMessage: MessageType })[];
    count: number;
    loading: "idle" | "pending" | "succeeded" | "failed";
    keyword: string;
};

type ActiveTabType = "chat" | "call" | "contact";
type InitialState = {
    show: boolean;
    activeTab: ActiveTabType;
    showProfileEditing: boolean;
    history: HistoryState;
};

export const leftSidebarSlice = createSlice({
    name: <string>"leftSidebar",
    initialState: <InitialState>{
        show: true,
        activeTab: "chat",
        showProfileEditing: false,
        history: { list: [], loading: "idle", keyword: "", count: null },
    },
    reducers: {
        setActiveTab(state, action: { payload: ActiveTabType }) {
            state.activeTab = action.payload;
        },
        show(state) {
            state.show = true;
        },
        hide(state) {
            state.show = false;
        },
        set(state, action: { payload: boolean }) {
            state.show = action.payload;
        },
        setOpenEditProfile(state, action: { payload: boolean }) {
            state.showProfileEditing = action.payload;
        },
        refreshOne(state, { payload: updatedRoom }: { payload: RoomType }) {
            const list = state.history.list.map((room) => {
                if (updatedRoom.id === room.id) {
                    room.avatarFileId = updatedRoom.avatarFileId;
                    room.name = updatedRoom.name;
                    room.users = updatedRoom.users;
                }

                return room;
            });

            state.history.list = [...list];
        },
        updateLastMessage(state, { payload: message }: { payload: MessageType }) {
            const list = state.history.list.map((room) => {
                if (message.roomId === room.id) {
                    room.lastMessage = message;
                }

                return room;
            });

            state.history.list = [...list];
        },
        removeRoom(state, { payload: roomId }: { payload: number }) {
            const list = state.history.list.filter((room) => room.id !== roomId);

            state.history.list = [...list];
        },
        resetUnreadCount(state, { payload: roomId }: { payload: number }) {
            const list = state.history.list.map((room) => {
                if (roomId === room.id) {
                    room.unreadCount = 0;
                }

                return room;
            });

            state.history.list = [...list];
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchHistory.fulfilled, (state, { payload }: any) => {
            const roomsIds = state.history.list.map((r) => r.id);
            const notAdded = payload.data.list.filter((u: any) => !roomsIds.includes(u.id));

            const list = state.history.list.map((room) => {
                const id = room.id;

                const newRoomInfo = payload.data.list.find((nr: any) => nr.id === id);

                return newRoomInfo || room;
            });

            if (state.history.keyword !== payload.keyword && payload.page === 1) {
                state.history.list = [...payload.data.list];
            } else {
                state.history.list = [...list, ...notAdded];
            }

            state.history.count = payload.data.count;
            state.history.loading = "idle";
            state.history.keyword = `${payload.keyword}`;
        });
        builder.addCase(fetchHistory.pending, (state) => {
            state.history.loading = "pending";
        });
        builder.addCase(fetchHistory.rejected, (state) => {
            state.history.loading = "failed";
        });
    },
});

export const selectActiveTab = (state: RootState): "chat" | "call" | "contact" =>
    state.leftSidebar.activeTab;

export const selectLeftSidebarOpen = (state: RootState): boolean => state.leftSidebar.show;

export const shouldShowProfileEditor = (state: RootState): boolean =>
    state.leftSidebar.showProfileEditing;

export const {
    show: showLeftSidebar,
    hide: hideLeftSidebar,
    set: setLeftSidebar,
    setActiveTab,
    setOpenEditProfile,
    refreshOne,
    updateLastMessage,
    removeRoom,
    resetUnreadCount,
} = leftSidebarSlice.actions;

export const selectHistory = (state: RootState): HistoryState => state.leftSidebar.history;
export const selectHistoryLoading =
    () =>
    (state: RootState): "idle" | "pending" | "succeeded" | "failed" =>
        state.leftSidebar.history.loading;

export default leftSidebarSlice.reducer;
