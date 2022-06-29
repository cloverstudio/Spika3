import { dynamicBaseQuery } from "../api/api";
import {
    addMessage,
    addMessageRecord,
    deleteMessage,
    editMessage,
} from "../features/chat/slice/chatSlice";
import { fetchHistory } from "../features/chat/slice/roomSlice";
import { store } from "../store/store";

const VALID_SSE_EVENT_TYPES = [
    "NEW_MESSAGE",
    "NEW_MESSAGE_RECORD",
    "DELETE_MESSAGE",
    "UPDATE_MESSAGE",
    "CALL_JOIN",
    "CALL_LEAVE",
];

import { notify as notifyCallEvent } from "../features/confcall/lib/callEventListener";

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

    switch (data.type) {
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
        }

        case "CALL_LEAVE": {
            notifyCallEvent(data);
        }

        default:
            break;
    }
}
