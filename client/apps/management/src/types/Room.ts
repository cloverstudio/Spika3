import { Room } from ".prisma/client";

type RoomType = Partial<
    Omit<Room, "createdAt" | "modifiedAt"> & { createdAt: number; modifiedAt: number }
>;

export default RoomType;

export type RoomListType = {
    list: RoomType[];
    count: number;
    limit: number;
};
