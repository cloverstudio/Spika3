import { useSelector } from "react-redux";
import { selectUserId } from "../../../store/userSlice";
import { selectMessageById } from "../slices/messages";

export default function useIsUsersMessage(roomId: number, id: number) {
    const message = useSelector(selectMessageById(roomId, id));
    const userId = useSelector(selectUserId);

    return message?.fromUserId === userId;
}
