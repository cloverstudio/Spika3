import { Room } from ".prisma/client";
import UserType from "./User";

export type RoomMixType = {
    room: RoomType;
    users: UserType[];
};

export type RoomListType = {
    list: RoomType[];
    count: number;
    limit: number;
};

export type RoomUserType = {
    isAdmin: boolean;
    userId: number;
    user: UserType;
};

export type RoomType = Omit<Room, "users" | "createdAt"> & {
    users: RoomUserType[];
};

export default RoomType;
