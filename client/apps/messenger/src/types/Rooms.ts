import { Room, User } from ".prisma/client";
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

export enum UpdateGroupAction {
    ADD_USERS = "addGroupUsers",
    REMOVE_USERS = "removeGroupUsers",
    ADD_ADMINS = "addGroupAdmins",
    REMOVE_ADMINS = "removeGroupAdmins",
    CHANGE_NAME = "changeGroupName",
    CHANGE_AVATAR = "changeGroupAvatar",
}

export type OngoingCall = {
    id: number;
    roomId: number;
    startedAt: Date;
    finishedAt: Date | null;
    participants: { user: User }[]
    room: {
        id: number;
        name: string;
        type: string;
        avatarFileId: number;

    }
}



type RoomsListType = {
    list: RoomType[];
    count: number;
    limit: number;
};

export default RoomsListType;
