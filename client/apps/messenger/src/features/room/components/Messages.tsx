import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import api, { dynamicBaseQuery } from "../../../api/api";
import { resetUnreadCount } from "../slices/leftSidebar";

import DeleteMessageDialog from "./message/DeleteMessageDialog";
import MessageDetailDialog from "./message/MessageDetailsModal";
import MessagesList from "./message/MessagesList";
import { useAppDispatch } from "../../../hooks";
import EmojiDialog from "./message/EmojiModal";
import CustomEmojiPickerModal from "./message/CustomEmojiPickerModal";
import { ImagePreviewModal } from "./message/ImagePreviewModal";

export default function Messages(): React.ReactElement {
    const roomId = parseInt(useParams().id || "");
    const dispatch = useAppDispatch();

    useEffect(() => {
        const markAsSeen = () =>
            dynamicBaseQuery({
                url: `/messenger/messages/${roomId}/seen`,
                method: "POST",
            }).then(() => {
                dispatch(resetUnreadCount(roomId));
                dispatch(api.util.invalidateTags([{ type: "UnreadCount" }]));
            });

        markAsSeen();

        window.addEventListener("focus", markAsSeen);

        return () => {
            window.removeEventListener("focus", markAsSeen);
        };
    }, [roomId, dispatch]);

    return (
        <>
            <MessagesList />
            <MessageDetailDialog />
            <DeleteMessageDialog />
            <EmojiDialog />
            <CustomEmojiPickerModal />
            <ImagePreviewModal />
        </>
    );
}
