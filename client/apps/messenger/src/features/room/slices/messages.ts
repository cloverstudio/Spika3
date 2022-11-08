import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { dynamicBaseQuery } from "../../../api/api";
import type { RootState } from "../../../store/store";

export const fetchMessages = createAsyncThunk(
    "messages/fetchByIdStatus",
    async (
        {
            roomId,
            targetMessageId,
        }: {
            roomId: number;
            targetMessageId?: number;
        },
        thunkAPI
    ) => {
        const cursor = (thunkAPI.getState() as RootState).messages[roomId]?.cursor;
        console.log({ cursor });
        let url = `/messenger/messages/roomId2/${roomId}?`;
        if (targetMessageId) {
            url += `&targetMessageId=${targetMessageId}`;
        }

        if (cursor) {
            url += `&cursor=${cursor}`;
        }

        const response = await dynamicBaseQuery(url);
        return response.data;
    }
);

interface InitialState {
    list: {
        [roomId: number]: {
            roomId: number;
            loading: boolean;
            messages: any[];
            count?: number;
            cursor?: number;
        };
    };
}

export const messagesSlice = createSlice({
    name: <string>"messages",
    initialState: <InitialState>{ list: {} },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchMessages.fulfilled, (state, { payload, meta }) => {
            const roomId = meta.arg.roomId;

            state.list[roomId].count = payload.count;
            state.list[roomId].cursor = payload.nextCursor;
            state.list[roomId].loading = false;
            state.list[roomId].messages = [...state.list[roomId].messages, ...payload.list];
        });
        builder.addCase(fetchMessages.pending, (state, { meta }) => {
            const roomId = meta.arg.roomId;
            const roomMsg = state.list[roomId];

            if (!roomMsg) {
                state.list[roomId] = { roomId, messages: [], loading: true };
            } else {
                state.list[roomId].loading = true;
            }
            console.log({ p: state.list[roomId] });
        });
    },
});

export const {} = messagesSlice.actions;

export const selectRoomMessages =
    (roomId: number) =>
    (state: RootState): any[] => {
        return state.messages.list[roomId]?.messages || [];
    };

export const selectRoomMessagesIsLoading =
    (roomId: number) =>
    (state: RootState): boolean => {
        return state.messages.list[roomId]?.loading;
    };

export default messagesSlice.reducer;
