import { Room } from "../../../types/Rooms";

export default function formatRoomInfo(room: Room, currentUserId: number): Room {
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
