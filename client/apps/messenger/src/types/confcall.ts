import UserType from "./User";

export type callEventPayload = {
    type: "CALL_LEAVE" | "CALL_JOIN" | "CALL_UPDATE";
    data: any;
};

export type CallParams = {
    videoProducerId: string;
    audioProducerId: string;
    screenshareProducerId: string;
    videoEnabled: boolean;
    audioEnabled: boolean;
};

export type Participant = {
    user: UserType;
    callParams: CallParams;
};
