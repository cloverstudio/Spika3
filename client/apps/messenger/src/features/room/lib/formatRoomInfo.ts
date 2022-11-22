import { RoomType } from "../../../types/Rooms";

export default function formatRoomInfo(room: RoomType, currentUserId: number): RoomType {
    if (room.type !== "private") {
        return room;
    }

    const formattedRoom = { ...room };
    const otherUser = room.users.find((u) => u.userId !== currentUserId);

    if (otherUser) {
        formattedRoom.name = otherUser?.user.displayName || "";
        formattedRoom.avatarUrl = otherUser?.user.avatarUrl || "";
        formattedRoom.avatarFileId = otherUser?.user.avatarFileId || 0;
    }

    return formattedRoom;
}
