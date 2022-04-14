import * as mediasoupClient from "mediasoup-client";
export interface CallMember {
    isMe: boolean;
    displayName: string;
    audioTrack?: MediaStreamTrack;
    videoTrack?: MediaStreamTrack;
    muteAudio: boolean;
    muteVideo: boolean;
    consumers: Array<mediasoupClient.types.Consumer>;
    id: string;
}

export interface CallParticipant {
    participant: CallMember;
}
