import api, { dynamicBaseQuery } from "../api/api";
import {
    addMessage,
    addMessageRecord,
    deleteMessage,
    editMessage,
} from "../features/chat/slice/chatSlice";
import { fetchHistory } from "../features/chat/slice/roomSlice";
import { store } from "../store/store";

const VALID_SSE_EVENT_TYPES = [
    "NEW_MESSAGE_RECORD",
    "NEW_MESSAGE",
    "DELETE_MESSAGE",
    "UPDATE_MESSAGE",
    "CALL_JOIN",
    "CALL_LEAVE",
    "CALL_UPDATE",
    "UPDATE_ROOM",
    "USER_UPDATE",
];

import { notify as notifyCallEvent } from "../features/confcall/lib/callEventListener";
import { fetchContact } from "../features/chat/slice/contactsSlice";
import { RoomType } from "../types/Rooms";

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
            await dynamicBaseQuery({
                url: "/messenger/messages/delivered",
                method: "POST",
                data: { messagesIds: [message.id] },
            });
            store.dispatch(addMessage(message));
            store.dispatch(fetchHistory({ page: 1, keyword: "" }));

            return;
        }

        case "NEW_MESSAGE_RECORD": {
            const messageRecord = data.messageRecord;
            if (!messageRecord) {
                console.log("Invalid NEW_MESSAGE_RECORD payload");
                return;
            }

            if (messageRecord.type === "reaction") {
                store.dispatch(
                    api.util.invalidateTags([
                        { type: "MessageRecords", id: messageRecord.messageId },
                    ])
                );
            } else {
                store.dispatch(addMessageRecord(messageRecord));
            }

            return;
        }

        case "DELETE_MESSAGE": {
            const message = data.message;
            if (!message) {
                console.log("Invalid DELETE_MESSAGE payload");
                return;
            }

            store.dispatch(deleteMessage(message));

            return;
        }

        case "UPDATE_MESSAGE": {
            const message = data.message;
            if (!message) {
                console.log("Invalid UPDATE_MESSAGE payload");
                return;
            }

            store.dispatch(editMessage(message));

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

            store.dispatch(fetchContact({ page: 1, keyword: "" }));
            const queries = store.getState().api.queries;

            if (!queries) {
                return;
            }

            const getRoomQueries = Object.entries(queries)
                .filter(
                    ([key, val]) =>
                        key.startsWith("getRoom(") &&
                        val?.data &&
                        (val.data as { room: RoomType }).room.users.find(
                            (u) => u.userId === user.id
                        )
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

            store.dispatch(fetchHistory({ page: 1, keyword: "" }));

            return;
        }

        default:
            break;
    }
}
