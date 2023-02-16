import { Room } from ".prisma/client";
import UserType from "./User";
import MessageType from "./Message";

export type RoomUserType = {
    isAdmin: boolean;
    userId: number;
    user: UserType;
};

export type RoomType = Omit<Room, "users" | "createdAt"> & {
    createdAt: number;
    users: RoomUserType[];
    unreadCount?: number;
    muted: boolean;
    pinned: boolean;
};

export type HistoryType = {
    list: { roomId: number; lastMessage: MessageType }[];
    count: number;
    limit: number;
};

type RoomsListType = {
    list: RoomType[];
    count: number;
    limit: number;
};

export default RoomsListType;
