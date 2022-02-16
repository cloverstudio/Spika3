export type RoomUser = {
    userId: number;
    isAdmin: boolean;
    displayName?: string;
    avatarUrl?: string;
};

export type Room = {
    id: number;
    type: string;
    name: string;
    avatarUrl: string;
    users: RoomUser[];
    createdAt: string;
};

export type LastMessage = {
    id: number;
    fromUserId: number;
    type: string;
    createdAt: string;
    modifiedAt: string;
    messageBody: { text: string };
};

export type RoomHistory = {
    id: number;
    type: string;
    name: string;
    avatarUrl: string;
    users: RoomUser[];
    lastMessage: LastMessage;
};

export type History = {
    list: RoomHistory[];
    count: number;
    limit: number;
};

type Rooms = {
    list: Room[];
    count: number;
    limit: number;
};

export default Rooms;
