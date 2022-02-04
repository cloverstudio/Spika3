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

type Rooms = {
    list: Room[];
    count: number;
    limit: number;
};

export default Rooms;
