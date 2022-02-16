import { Room, RoomHistory } from "../../../types/Rooms";

export default function formatRoomInfo(
    room: Room | RoomHistory,
    currentUserId: number
): Room | RoomHistory {
    if (room.type !== "private") {
        return room;
    }

    const formatedRoom = { ...room };
    const otherUser = room.users.find((u) => u.userId !== currentUserId);

    if (otherUser) {
        formatedRoom.name = otherUser?.displayName || "";
        formatedRoom.avatarUrl = otherUser?.avatarUrl || "";
    }

    return formatedRoom;
}
