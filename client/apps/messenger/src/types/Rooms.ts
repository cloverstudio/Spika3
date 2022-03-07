import { Room } from ".prisma/client";
import UserType from "./User";
import MessageType from "./Message";

type RoomUserType = {
    isAdmin: boolean;
    userId: number;
    user: UserType;
};

export type RoomType = Omit<Room, "users" | "createdAt"> & {
    createdAt: number;
    users: RoomUserType[];
};

export type HistoryType = {
    list: (RoomType & { lastMessage: MessageType })[];
    count: number;
    limit: number;
};

type RoomsListType = {
    list: RoomType[];
    count: number;
    limit: number;
};

export default RoomsListType;