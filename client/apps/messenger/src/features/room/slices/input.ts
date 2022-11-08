import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { dynamicBaseQuery } from "../../../api/api";
import type { RootState } from "../../../store/store";
import MessageType from "../../../types/Message";

interface InitialState {
    list: { [roomId: number]: { roomId: number; text: string; type: string } };
}

export const sendMessage = createAsyncThunk(
    "messages/sendMessage",
    async (roomId: number, thunkAPI): Promise<{ message: MessageType }> => {
        const input = (thunkAPI.getState() as RootState).input.list[roomId];
        if (!input) {
            return;
        }

        const { text, type } = input;

        if (!text && type === "text") {
            return;
        }

        const body: { text?: string } = {};

        if (type === "text") {
            body.text = text;
        }

        const response = await dynamicBaseQuery({
            url: "/messenger/messages",
            data: {
                type,
                body,
            },
            method: "POST",
        });

        // thunkAPI.dispatch(fetchHistory({ page: 1, keyword: "" }));
        return response.data;
    }
);

export const inputSlice = createSlice({
    name: <string>"input",
    initialState: <InitialState>{ list: {} },
    reducers: {
        setText: (state, action: { payload: { text: string; roomId: number } }) => {
            const { text, roomId } = action.payload;

            const current = state.list[roomId] || { type: "text" };

            state.list[roomId] = { ...current, text, roomId };
        },
    },
    // extraReducers: (builder) => {},
});

export const { setText: setInputText } = inputSlice.actions;

export const selectInputText =
    (roomId: number) =>
    (state: RootState): string => {
        const input = state.input.list[roomId];

        return input?.text || "";
    };
export default inputSlice.reducer;
