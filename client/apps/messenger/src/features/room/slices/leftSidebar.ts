import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { dynamicBaseQuery } from "../../../api/api";
import type { RootState } from "../../../store/store";
import MessageType from "../../../types/Message";

export const fetchHistory = createAsyncThunk("room/fetchHistory", async (_, thunkAPI) => {
    const { count, page, keyword } = (thunkAPI.getState() as RootState).leftSidebar.history;
    const noMore = count === 0 || !!(count && (page - 1) * 20 >= count);

    if (noMore) {
        throw new Error("Can't fetch");
    }
    let url = `/messenger/history?page=${page}`;

    if (keyword) {
        url += `&keyword=${keyword}`;
    }

    const response = await dynamicBaseQuery(url);

    return {
        data: response.data,
    };
});

export const refreshHistory = createAsyncThunk("room/refreshHistory", async (roomId: number) => {
    const url = `/messenger/history/roomId/${roomId}`;

    const response = await dynamicBaseQuery(url);

    return response.data;
});

type HistoryListItem = {
    roomId: number;
    lastMessage: MessageType;
    unreadCount?: number;
    muted: boolean;
    pinned: boolean;
};

type HistoryStateType = {
    list: HistoryListItem[];
    count: number;
    page: number;
    loading: "idle" | "pending" | "succeeded" | "failed";
    keyword: string;
};

type ActiveTabType = "chat" | "call" | "contact";
type InitialState = {
    activeTab: ActiveTabType;
    showProfileEditing: boolean;
    history: HistoryStateType;
};

export const leftSidebarSlice = createSlice({
    name: <string>"leftSidebar",
    initialState: <InitialState>{
        activeTab: "chat",
        showProfileEditing: false,
        history: { list: [], loading: "idle", keyword: "", count: null, page: 1 },
    },
    reducers: {
        setActiveTab(state, action: { payload: ActiveTabType }) {
            state.activeTab = action.payload;
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
        setKeyword(state, { payload: keyword }: { payload: string }) {
            state.history.keyword = keyword;
            state.history.count = null;
            state.history.page = 1;
            state.history.loading = "idle";
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

            if (payload.data.page === 1) {
                state.history.list = [...payload.data.list];
            } else {
                state.history.list = [...list, ...notAdded];
            }

            state.history.count = payload.data.count;
            state.history.loading = "idle";
            state.history.page = payload.data.page + 1;
        });
        builder.addCase(fetchHistory.pending, (state) => {
            state.history.loading = "pending";
        });
        builder.addCase(fetchHistory.rejected, (state) => {
            state.history.loading = "failed";
        });
        builder.addCase(
            refreshHistory.fulfilled,
            (state, { payload }: { payload: HistoryListItem }) => {
                const roomsIds = state.history.list.map((r) => r.roomId);
                const keyword = state.history.keyword;
                const exists = roomsIds.includes(payload.roomId);

                if (!exists && !keyword) {
                    state.history.list = [payload, ...state.history.list];
                } else {
                    state.history.list = state.history.list.map((item) => {
                        const id = item.roomId;

                        if (id === payload.roomId) {
                            item = payload;
                        }

                        return item;
                    });
                }
            }
        );
    },
});

export const selectActiveTab = (state: RootState): "chat" | "call" | "contact" =>
    state.leftSidebar.activeTab;

export const shouldShowProfileEditor = (state: RootState): boolean =>
    state.leftSidebar.showProfileEditing;

export const {
    setActiveTab,
    setOpenEditProfile,
    updateLastMessage,
    removeRoom,
    resetUnreadCount,
    setKeyword,
} = leftSidebarSlice.actions;

export const selectHistory = (state: RootState): HistoryListItem[] =>
    state.leftSidebar.history.list;
export const selectKeyword = (state: RootState): string => state.leftSidebar.history.keyword;
export const selectHistoryLoading =
    () =>
    (state: RootState): "idle" | "pending" | "succeeded" | "failed" =>
        state.leftSidebar.history.loading;

export default leftSidebarSlice.reducer;
