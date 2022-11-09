import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { generateRandomString } from "../../../../../../lib/utils";
import { dynamicBaseQuery } from "../../../api/api";
import type { RootState } from "../../../store/store";
import MessageType, { MessageListType } from "../../../types/Message";

export const fetchMessages = createAsyncThunk(
    "messages/fetchMessages",
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
        const room = (thunkAPI.getState() as RootState).messages.list[roomId];
        const { cursor, count } = room || {};
        console.log("Fetch messages: ", { room });

        if (count && !cursor) {
            console.error("fetchMessagesError: Nothing to load");

            throw new Error("fetchMessagesError: Nothing to load");
        }

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

export const sendMessage = createAsyncThunk(
    "messages/sendMessage2",
    async (roomId: number, thunkAPI): Promise<{ message: MessageType }> => {
        const input = (thunkAPI.getState() as RootState).input.list[roomId];
        if (!input) {
            throw new Error("Missing fields!");
        }
        const { text, type } = input;

        if (!text && type === "text") {
            throw new Error("Missing fields!");
        }

        const localId = generateRandomString(12);

        const body: { text?: string } = {};

        if (type === "text") {
            body.text = text;
        }

        thunkAPI.dispatch(
            messagesSlice.actions.setSending({
                roomId,
                type,
                body,
                status: "sending",
                localId,
            })
        );

        try {
            const response = await dynamicBaseQuery({
                url: "/messenger/messages",
                data: {
                    roomId,
                    type,
                    body,
                    localId,
                },
                method: "POST",
            });

            return response.data;
        } catch (error) {
            thunkAPI.dispatch(
                messagesSlice.actions.setSending({
                    roomId,
                    type,
                    body,
                    status: "failed",
                    localId,
                })
            );

            throw error;
        }
        // thunkAPI.dispatch(fetchHistory({ page: 1, keyword: "" }));
    }
);

type SendingMessageType = {
    status: string;
    type: string;
    body: any;
    localId: string;
};

type InitialState = {
    list: {
        [roomId: number]: {
            roomId: number;
            loading: boolean;
            messages: { [id: string]: MessageType };
            count?: number;
            cursor?: number;
            sending: {
                list: {
                    [localId: string]: SendingMessageType;
                };
            };
        };
    };
};

export const messagesSlice = createSlice({
    name: <string>"messages",
    initialState: <InitialState>{ list: {} },
    reducers: {
        setSending(
            state,
            action: {
                payload: {
                    status: string;
                    body: any;
                    type: string;
                    localId: string;
                    roomId: number;
                };
            }
        ) {
            const { roomId, status, body, localId, type } = action.payload;
            const room = state.list[roomId];

            room.sending.list[localId] = { status, body, localId, type };
        },
    },
    extraReducers: (builder) => {
        builder.addCase(
            fetchMessages.fulfilled,
            (state, { payload, meta }: { payload: MessageListType; meta: any }) => {
                const roomId = meta.arg.roomId;
                console.log({ payload });
                state.list[roomId].count = payload.count;
                state.list[roomId].cursor = payload.nextCursor;
                state.list[roomId].loading = false;

                payload.list.forEach((m) => {
                    state.list[roomId].messages[m.id] = m;
                });
            }
        );
        builder.addCase(fetchMessages.pending, (state, { meta }) => {
            const roomId = meta.arg.roomId;
            const room = state.list[roomId];

            if (!room) {
                state.list[roomId] = { roomId, messages: {}, loading: true, sending: { list: {} } };
            } else {
                room.loading = true;
            }
        });

        builder.addCase(fetchMessages.rejected, (state, { meta }) => {
            const roomId = meta.arg.roomId;
            const room = state.list[roomId];

            room.loading = false;
        });

        builder.addCase(sendMessage.fulfilled, (state, { payload }) => {
            console.log({ payload });
            const { message } = payload;
            const { roomId } = message;

            const room = state.list[roomId];

            room.messages[payload.message.id] = payload.message;
            delete room.sending.list[message.localId];
        });
    },
});

export const { setSending } = messagesSlice.actions;

export const selectRoomMessages =
    (roomId: number) =>
    (
        state: RootState
    ): {
        [id: string]: MessageType;
    } => {
        return state.messages.list[roomId]?.messages || {};
    };

export const selectRoomSendingMessages =
    (roomId: number) =>
    (
        state: RootState
    ): {
        [localId: string]: SendingMessageType;
    } => {
        return state.messages.list[roomId]?.sending.list || {};
    };

export const selectRoomMessagesIsLoading =
    (roomId: number) =>
    (state: RootState): boolean => {
        return state.messages.list[roomId]?.loading;
    };

export const canLoadMoreMessages =
    (roomId: number) =>
    (state: RootState): boolean => {
        const room = state.messages.list[roomId];

        if (!room) {
            return true;
        }

        if (room.loading) {
            return false;
        }

        if (room.count && !room.cursor) {
            return false;
        }

        return true;
    };

export const selectMessageById =
    (roomId: number, id: number) =>
    (state: RootState): MessageType | null => {
        const room = state.messages.list[roomId];

        if (!room) {
            return null;
        }

        const message = room.messages[id];

        if (!message) {
            return null;
        }

        return message;
    };

export default messagesSlice.reducer;
