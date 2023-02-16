import { callEventPayload } from "../../../types/confcall";
import Utils from "./utils";

const listeners: Record<string, (payload: callEventPayload) => void> = {};

export function listen(listener: (payload: callEventPayload) => void): () => void {
    const identifier = Utils.randomStr(16);
    listeners[identifier] = listener;

    return () => {
        delete listeners[identifier];
    };
}

export function notify(data: callEventPayload) {
    Object.keys(listeners).map((key) => {
        const func: (payload: callEventPayload) => void = listeners[key];
        func(data);
    });
}
