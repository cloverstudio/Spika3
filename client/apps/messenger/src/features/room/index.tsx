import React from "react";

import { Box } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";

import Header from "./components/Header";
import useTheme from "@mui/material/styles/useTheme";
import Messages from "./components/Messages";
import ChatInput from "./components/ChatInput";
import ConfCall from "../confcall";
import { useParams, useSearchParams } from "react-router-dom";
import { useGetRoomQuery } from "./api/room";
import BotInfo from "./components/BotInfo";
import { selectUserId } from "../../store/userSlice";
import { useSelector } from "react-redux";

export default function Room(): React.ReactElement {
    const isCall = /^.+\/call.*$/.test(window.location.pathname);
    const roomId = parseInt(useParams().id || "");

    return (
        <RoomContainer key={roomId}>
            <Header />
            <Messages />
            <ChatInput />
            {isCall && <ConfCall />}
        </RoomContainer>
    );
}

function RoomContainer({ children }: { children: React.ReactNode }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const roomId = parseInt(useParams().id || "");
    const { data, error } = useGetRoomQuery(roomId);
    const userId = useSelector(selectUserId);
    const [searchParams] = useSearchParams();

    const mobileProps = {
        position: "absolute" as const,
        bottom: "0",
        top: "0",
        left: "0",
        right: "0",
    };

    const desktopProps = {
        height: "100vh",
        overflow: "hidden",
    };

    if (error) {
        return <Box p={2}>Chat not found</Box>;
    }

    if (!data) {
        return null;
    }

    const otherUser = data.type === "private" && data.users.find((u) => u.userId !== userId)?.user;
    const otherUserIsBot = otherUser?.isBot;

    if (otherUserIsBot && searchParams.get("showBotInfo")) {
        return <BotInfo bot={otherUser} />;
    }
    return (
        <Box display="flex" flexDirection="column" sx={isMobile ? mobileProps : desktopProps}>
            {children}
        </Box>
    );
}
