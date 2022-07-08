import { useEffect, useState } from "react";
import faker from "faker";

import { callEventPayload } from "../../../types/confcall";

const listeners: Record<string, (payload: callEventPayload) => void> = {};

export function listen(listener: (payload: callEventPayload) => void): () => void {
    const identifier = faker.datatype.string(16);
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
