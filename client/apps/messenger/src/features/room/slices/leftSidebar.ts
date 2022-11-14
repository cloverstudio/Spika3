import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { dynamicBaseQuery } from "../../../api/api";
import type { RootState } from "../../../store/store";
import MessageType from "../../../types/Message";
import { RoomType } from "../../../types/Rooms";

export const fetchHistory = createAsyncThunk(
    "room/fetchHistory",
    async (args: { page: number; keyword: string }) => {
        const response = await dynamicBaseQuery(
            `/messenger/history?page=${args.page}&keyword=${args.keyword}`
        );

        return {
            data: response.data,
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
                    room.avatarUrl = updatedRoom.avatarUrl;
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
    state.leftSidebar2.activeTab;

export const selectLeftSidebarOpen = (state: RootState): boolean => state.leftSidebar2.show;

export const shouldShowProfileEditor = (state: RootState): boolean =>
    state.leftSidebar2.showProfileEditing;

export const {
    show: showLeftSidebar,
    hide: hideLeftSidebar,
    set: setLeftSidebar,
    setActiveTab,
    setOpenEditProfile,
    refreshOne,
    updateLastMessage,
    removeRoom,
} = leftSidebarSlice.actions;

export const selectHistory = (state: RootState): HistoryState => state.leftSidebar2.history;
export const selectHistoryLoading =
    () =>
    (state: RootState): "idle" | "pending" | "succeeded" | "failed" =>
        state.leftSidebar2.history.loading;

export default leftSidebarSlice.reducer;
