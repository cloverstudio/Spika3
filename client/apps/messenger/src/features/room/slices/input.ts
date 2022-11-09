import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { dynamicBaseQuery } from "../../../api/api";
import type { RootState } from "../../../store/store";
import MessageType from "../../../types/Message";
import { setSending } from "./messages";

interface InitialState {
    list: { [roomId: number]: { roomId: number; text: string; type: string } };
}

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
    extraReducers: (builder) => {
        builder.addCase(setSending, (state, { payload }) => {
            const roomId = payload.roomId;

            if (state.list[roomId]) {
                state.list[roomId].text = "";
                state.list[roomId].type = "text";
            } else {
                console.error("input slice error, send message can't find room input state");
            }
        });
    },
});

export const { setText: setInputText } = inputSlice.actions;

export const selectInputText =
    (roomId: number) =>
    (state: RootState): string => {
        const input = state.input.list[roomId];

        return input?.text || "";
    };
export default inputSlice.reducer;
