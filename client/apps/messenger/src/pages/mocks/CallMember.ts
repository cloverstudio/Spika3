export interface CallMember {
    isMe: boolean;
    displayName: string;
    audioTrack?: MediaStreamTrack;
    videoTrack?: MediaStreamTrack;
    muteAudio: boolean;
    muteVideo: boolean;
}

export interface CallParticipant {
    participant: CallMember;
}
