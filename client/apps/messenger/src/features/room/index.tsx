import React from "react";

import { Box } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";

import Header from "./components/Header";
import useTheme from "@mui/material/styles/useTheme";
import Messages from "./components/Messages";
import ChatInput from "./components/ChatInput";
import ConfCall from "../confcall";
import TitleUpdater from "./components/TitleUpdater";
import { useParams } from "react-router-dom";

export default function Room(): React.ReactElement {
    const isCall = /^.+\/call.*$/.test(window.location.pathname);
    const roomId = parseInt(useParams().id || "");

    return (
        <RoomContainer key={roomId}>
            <Header />
            <Messages />
            <ChatInput />
            {isCall && <ConfCall />}
            <TitleUpdater />
        </RoomContainer>
    );
}

function RoomContainer({ children }: { children: React.ReactNode }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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

    return (
        <Box display="flex" flexDirection="column" sx={isMobile ? mobileProps : desktopProps}>
            {children}
        </Box>
    );
}
