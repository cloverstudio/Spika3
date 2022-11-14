import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../../store/store";
import MessageType from "../../../types/Message";
import { setSending } from "./messages";

interface InitialState {
    list: {
        [roomId: number]: {
            roomId: number;
            text: string;
            type: string;
            replyMessage?: MessageType;
            editMessage?: MessageType;
        };
    };
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
        setInputType: (state, action: { payload: { type: string; roomId: number } }) => {
            const { type, roomId } = action.payload;

            const current = state.list[roomId] || { text: "" };

            state.list[roomId] = { ...current, type, roomId };
        },
        setEditMessage: (state, action: { payload: { roomId: number; message?: MessageType } }) => {
            const { message, roomId } = action.payload;

            if (!state.list[roomId]) {
                state.list[roomId] = { type: "text", roomId, text: "" };
            }

            state.list[roomId].editMessage = message;
            state.list[roomId].replyMessage = null;

            if (message) {
                state.list[roomId].text = message.body.text;
            }
        },
        setReplyMessage: (
            state,
            action: { payload: { roomId: number; message?: MessageType } }
        ) => {
            const { message, roomId } = action.payload;

            if (!state.list[roomId]) {
                state.list[roomId] = { type: "text", roomId, text: "" };
            }

            state.list[roomId].replyMessage = message;
            state.list[roomId].editMessage = null;
        },
        addEmoji: (state, { payload }: { payload: { roomId: number; emoji: string } }) => {
            const { emoji, roomId } = payload;

            state.list[roomId].text += emoji;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(setSending, (state, { payload }) => {
            const roomId = payload.roomId;

            if (state.list[roomId]) {
                state.list[roomId].text = "";
                state.list[roomId].type = "text";
                state.list[roomId].editMessage = null;
                state.list[roomId].replyMessage = null;
            } else {
                console.error("input slice error, send message can't find room input state");
            }
        });
    },
});

export const selectInputText =
    (roomId: number) =>
    (state: RootState): string => {
        const input = state.input.list[roomId];

        return input?.text || "";
    };

export const selectInputType =
    (roomId: number) =>
    (state: RootState): string => {
        const input = state.input.list[roomId];

        return input?.type || "";
    };

export const selectReplyMessage =
    (roomId: number) =>
    (state: RootState): MessageType => {
        const input = state.input.list[roomId];

        return input?.replyMessage;
    };

export const selectEditMessage =
    (roomId: number) =>
    (state: RootState): MessageType => {
        const input = state.input.list[roomId];

        return input?.editMessage;
    };

export default inputSlice.reducer;

export const {
    setText: setInputText,
    setEditMessage,
    setInputType,
    addEmoji,
    setReplyMessage,
} = inputSlice.actions;
