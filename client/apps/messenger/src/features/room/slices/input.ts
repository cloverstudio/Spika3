import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../../store/store";
import MessageType from "../../../types/Message";
import { setSending } from "./messages";
import { dynamicBaseQuery } from "../../../api/api";

interface InitialState {
    list: {
        [roomId: number]: {
            roomId: number;
            text: string;
            type: string;
            replyMessage?: MessageType;
            editMessage?: MessageType;
            messageCursorPosition?: number;
            thumbnailUrl?: string;
            thumbnailData?: {
                title?: string;
                image?: string;
                icon?: string;
                description?: string;
                url: string;
            };
            isThumbnailDataLoading?: boolean;
            isThumbnailDataFetchingAborted?: boolean;
        };
    };
}

export const fetchThumbnailData = createAsyncThunk(
    "input/fetchThumbnailData",
    async (args: { url: string; roomId: number }) => {
        const response = await dynamicBaseQuery(
            `/messenger/messages/get-thumbnail?url=${args.url}`,
        );

        return {
            data: response.data,
            roomId: args.roomId,
        };
    },
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
            action: { payload: { roomId: number; message?: MessageType } },
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

            if (!state.list[roomId]) return;

            const text = state.list[roomId].text;
            const cursorPosition = state.list[roomId].messageCursorPosition;
            if (cursorPosition === undefined) return;
            const updatedText = text.slice(0, cursorPosition) + emoji + text.slice(cursorPosition);

            state.list[roomId].text = updatedText;
            state.list[roomId].messageCursorPosition = cursorPosition + emoji.length;
        },
        setThumbnailUrl: (state, { payload }: { payload: { roomId: number; url: string } }) => {
            const { url, roomId } = payload;

            if (!state.list[roomId]) return;

            state.list[roomId].thumbnailUrl = url;
        },
        removeThumbnailData: (state, { payload }: { payload: { roomId: number } }) => {
            const { roomId } = payload;

            if (!state.list[roomId]) return;
            state.list[roomId].isThumbnailDataLoading = false;
            state.list[roomId].thumbnailData = null;
        },
        setIsThumbnailDataLoading: (
            state,
            { payload }: { payload: { roomId: number; isLoading } },
        ) => {
            const { roomId, isLoading } = payload;

            if (!state.list[roomId]) return;
            state.list[roomId].isThumbnailDataLoading = isLoading;
        },
        setIsThumbnailDataFetchingAborted: (
            state,
            { payload }: { payload: { roomId: number; isAborted: boolean } },
        ) => {
            const { roomId, isAborted } = payload;

            if (!state.list[roomId]) return;
            state.list[roomId].isThumbnailDataFetchingAborted = isAborted;
        },
        setMessageCursorPosition: (
            state,
            { payload }: { payload: { roomId: number; position: number } },
        ) => {
            const { roomId, position } = payload;

            if (!state.list[roomId]) return;
            state.list[roomId].messageCursorPosition = position;
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
                state.list[roomId].thumbnailData = null;
            } else {
                console.error("input slice error, send message can't find room input state");
            }
        });

        builder.addCase(fetchThumbnailData.fulfilled, (state, { payload }) => {
            const { data, roomId } = payload;

            const isFetchingAborted = state.list[roomId].isThumbnailDataFetchingAborted;

            if (isFetchingAborted) {
                state.list[roomId].thumbnailData = null;
                state.list[roomId].isThumbnailDataLoading = false;
                state.list[roomId].isThumbnailDataFetchingAborted = false;
                return;
            }
            state.list[roomId].thumbnailData = data;
            state.list[roomId].isThumbnailDataLoading = false;
        });
        builder.addCase(fetchThumbnailData.rejected, (state, action) => {
            const roomId = action.meta.arg.roomId;

            state.list[roomId].thumbnailData = null;
            state.list[roomId].isThumbnailDataLoading = false;
            state.list[roomId].isThumbnailDataFetchingAborted = false;
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
    setThumbnailUrl,
    removeThumbnailData,
    setIsThumbnailDataLoading,
    setIsThumbnailDataFetchingAborted,
    setMessageCursorPosition,
} = inputSlice.actions;
