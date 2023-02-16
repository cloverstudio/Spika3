import { Box, CircularProgress } from "@mui/material";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { dynamicBaseQuery } from "../../../api/api";
import { resetUnreadCount } from "../slices/leftSidebar";

import DeleteMessageDialog from "./message/DeleteMessageDialog";
import MessageDetailDialog from "./message/MessageDetailsModal";
import MessagesList from "./message/MessagesList";

export default function Messages(): React.ReactElement {
    const roomId = parseInt(useParams().id || "");
    const dispatch = useDispatch();

    useEffect(() => {
        const markAsSeen = () =>
            dynamicBaseQuery({
                url: `/messenger/messages/${roomId}/seen`,
                method: "POST",
            }).then(() => {
                dispatch(resetUnreadCount(roomId));
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
        </>
    );
}
