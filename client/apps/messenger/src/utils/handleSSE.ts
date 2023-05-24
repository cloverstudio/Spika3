import api, { dynamicBaseQuery } from "../api/api";

import { refreshHistory, removeRoom } from "../features/room/slices/leftSidebar";
import { RootState, store } from "../store/store";

const VALID_SSE_EVENT_TYPES = [
    "NEW_MESSAGE_RECORD",
    "NEW_MESSAGE",
    "DELETE_MESSAGE",
    "UPDATE_MESSAGE",
    "CALL_JOIN",
    "CALL_LEAVE",
    "CALL_UPDATE",
    "UPDATE_ROOM",
    "DELETE_ROOM",
    "USER_UPDATE",
    "SEEN_ROOM",
    "REMOVED_FROM_ROOM",
];

import { notify as notifyCallEvent } from "../features/confcall/lib/callEventListener";
import { fetchContacts } from "../features/room/slices/contacts";
import { RoomType } from "../types/Rooms";
import newMessageSound from "../../../../assets/newmessage.mp3";
import {
    addMessage,
    addMessageRecord,
    deleteMessage,
    editMessage,
} from "../features/room/slices/messages";

export default async function handleSSE(event: MessageEvent): Promise<void> {
    const data = event.data ? JSON.parse(event.data) : {};

    if (!data || !data?.type) {
        return;
    }

    const eventType = data.type;
    const eventTypeIsImplemented = VALID_SSE_EVENT_TYPES.includes(eventType);

    if (!eventTypeIsImplemented) {
        console.log(`Received SSE (${eventType}) that is not implemented yet!`);
        return;
    }

    switch (eventType) {
        case "NEW_MESSAGE": {
            const message = data.message;
            if (!message) {
                console.log("Invalid NEW_MESSAGE payload");
                return;
            }

            store.dispatch(addMessage(message));

            const userIsInRoom = document.URL.includes(`/rooms/${message.roomId}`);

            if (document.hidden || !userIsInRoom) {
                await dynamicBaseQuery({
                    url: "/messenger/messages/delivered",
                    method: "POST",
                    data: { messagesIds: [message.id] },
                });
            } else {
                await dynamicBaseQuery({
                    url: `/messenger/messages/${message.roomId}/seen`,
                    method: "POST",
                });
            }

            store.dispatch(refreshHistory(message.roomId as number));
            const queries = (store.getState() as RootState).api.queries;

            if (!queries) {
                return;
            }

            const getRoomQueries = Object.entries(queries)
                .filter(([key]) => key.startsWith("getRoom("))
                .map(([_, val]) => val);

            const getRoomQuery = getRoomQueries.find((q) => q.originalArgs === message.roomId);

            const isMute = getRoomQuery?.data?.muted;

            // play sound logic

            if (isMute || !document.hidden || message.fromUserId === store.getState().user.id) {
                return;
            }

            const audio = new Audio(newMessageSound);
            audio.volume = 0.5;

            audio.play();
            return;
        }

        case "NEW_MESSAGE_RECORD": {
            console.log("new message record");
            const messageRecord = data.messageRecord;
            if (!messageRecord) {
                console.log("Invalid NEW_MESSAGE_RECORD payload");
                return;
            }

            store.dispatch(addMessageRecord(messageRecord));

            return;
        }

        case "DELETE_MESSAGE": {
            const message = data.message;
            if (!message) {
                console.log("Invalid DELETE_MESSAGE payload");
                return;
            }

            store.dispatch(deleteMessage(message));
            store.dispatch(refreshHistory(message.roomId as number));

            return;
        }

        case "UPDATE_MESSAGE": {
            const message = data.message;
            if (!message) {
                console.log("Invalid UPDATE_MESSAGE payload");
                return;
            }

            store.dispatch(editMessage(message));
            store.dispatch(refreshHistory(message.roomId as number));

            return;
        }

        case "CALL_JOIN": {
            notifyCallEvent(data);

            return;
        }

        case "CALL_LEAVE": {
            notifyCallEvent(data);

            return;
        }

        case "CALL_UPDATE": {
            notifyCallEvent(data);

            return;
        }

        case "UPDATE_ROOM": {
            const room = data.room;

            if (!room) {
                console.log("Invalid UPDATE_ROOM payload");
                return;
            }

            store.dispatch(api.util.invalidateTags([{ type: "Rooms", id: room.id }]));
            return;
        }

        case "USER_UPDATE": {
            const user = data.user;

            if (!user) {
                console.log("Invalid USER_UPDATE payload");

                return;
            }

            store.dispatch(fetchContacts());
            const queries = store.getState().api.queries;

            if (!queries) {
                return;
            }

            const getRoomQueries = Object.entries(queries)
                .filter(
                    ([key, val]) =>
                        key.startsWith("getRoom(") &&
                        val?.data &&
                        (val.data as RoomType).users.find((u) => u.userId === user.id)
                )
                .map(([_, val]) => val);

            if (!getRoomQueries.length) {
                return;
            }

            for (const query of getRoomQueries) {
                store.dispatch(
                    api.util.invalidateTags([{ type: "Rooms", id: query.originalArgs as number }])
                );
            }

            return;
        }

        case "DELETE_ROOM": {
            const room = data.room;

            if (!room) {
                console.log("Invalid DELETE_ROOM payload");
                return;
            }

            store.dispatch(removeRoom(room.id as number));
            store.dispatch(api.util.invalidateTags([{ type: "Rooms", id: room.id }]));

            return;
        }

        case "SEEN_ROOM": {
            const roomId = data.roomId;

            if (!roomId) {
                console.log("Invalid SEEN_ROOM payload");
                return;
            }

            store.dispatch(api.util.invalidateTags([{ type: "Rooms", id: roomId }]));
            store.dispatch(refreshHistory(roomId as number));

            return;
        }

        case "REMOVED_FROM_ROOM": {
            const roomId = data.roomId;

            if (!roomId) {
                console.log("Invalid REMOVED_FROM_ROOM payload");
                return;
            }

            store.dispatch(api.util.invalidateTags([{ type: "Rooms", id: roomId }]));
            store.dispatch(removeRoom(roomId as number));

            return;
        }

        default:
            break;
    }
}
