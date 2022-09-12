import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Box, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import { useGetRoomQuery } from "./api/room";
import { useMarkRoomMessagesAsSeenMutation } from "./api/message";

import { selectRoomMessagesCount, setActiveRoomId } from "./slice/chatSlice";
import { selectUser } from "../../store/userSlice";

import Loader from "../../components/Loader";

import formatRoomInfo from "./lib/formatRoomInfo";
import ChatInput from "./components/ChatInput";
import RoomHeader from "./components/RoomHeader";
import RoomMessages from "./components/RoomMessages";
import ConfCall from "../confcall/index";
import TitleUpdater from "./components/TitleUpdater";

export default function Chat(): React.ReactElement {
    const roomId = parseInt(useParams().id || "");
    const user = useSelector(selectUser);
    const dispatch = useDispatch();
    const { data, isLoading } = useGetRoomQuery(roomId);
    const [markRoomMessagesAsSeen] = useMarkRoomMessagesAsSeenMutation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const count = useSelector(selectRoomMessagesCount(roomId));
    const isCall = /^.+\/call.*$/.test(window.location.pathname);

    const room = data?.room;

    useEffect(() => {
        dispatch(setActiveRoomId(roomId));

        return () => {
            dispatch(setActiveRoomId(null));
        };
    }, [dispatch, roomId]);

    useEffect(() => {
        markRoomMessagesAsSeen(roomId);
    }, [dispatch, roomId, markRoomMessagesAsSeen, count]);

    if (isLoading) {
        return <Loader />;
    }

    if (!room) {
        return <Box>Room not found</Box>;
    }

    const mobileProps = {
        position: "absolute" as const,
        bottom: "0",
        top: "0",
        left: "0",
        right: "0",
    };

    const desktopProps = {
        height: "100vh",
    };

    return (
        <Box display="flex" flexDirection="column" sx={isMobile ? mobileProps : desktopProps}>
            {user?.id && <RoomHeader {...formatRoomInfo(room, user.id)} roomId={roomId} />}
            <RoomMessages roomId={roomId} />
            <ChatInput />
            {isCall && <ConfCall />}
            <TitleUpdater {...formatRoomInfo(room, user.id)} roomId={roomId} />
        </Box>
    );
}
