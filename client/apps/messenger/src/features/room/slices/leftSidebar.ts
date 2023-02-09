import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { dynamicBaseQuery } from "../../../api/api";
import type { RootState } from "../../../store/store";
import MessageType from "../../../types/Message";
import { RoomType } from "../../../types/Rooms";

export const fetchHistory = createAsyncThunk(
    "room/fetchHistory",
    async (args: { page: number; keyword: string }, thunkAPI) => {
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
    list: {
        roomId: number;
        lastMessage: MessageType;
        unreadCount?: number;
        muted: boolean;
        pinned: boolean;
    }[];
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
        updateLastMessage(state, { payload: message }: { payload: MessageType }) {
            const list = state.history.list.map((item) => {
                if (message.roomId === item.roomId) {
                    item.lastMessage = message;
                }

                return item;
            });

            state.history.list = [...list];
        },
        removeRoom(state, { payload: roomId }: { payload: number }) {
            const list = state.history.list.filter((room) => room.roomId !== roomId);

            state.history.list = [...list];
        },
        resetUnreadCount(state, { payload: roomId }: { payload: number }) {
            const list = state.history.list.map((item) => {
                if (roomId === item.roomId) {
                    item.unreadCount = 0;
                }

                return item;
            });

            state.history.list = [...list];
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchHistory.fulfilled, (state, { payload }: any) => {
            const roomsIds = state.history.list.map((r) => r.roomId);
            const notAdded = payload.data.list.filter((u: any) => !roomsIds.includes(u.roomId));

            const list = state.history.list.map((item) => {
                const id = item.roomId;

                const newRoomInfo = payload.data.list.find((nr) => nr.roomId === id);

                return newRoomInfo || item;
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
