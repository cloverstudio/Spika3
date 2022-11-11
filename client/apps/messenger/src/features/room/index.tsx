import React from "react";

import { Box, useMediaQuery } from "@mui/material";
import Header from "./components/room/Header";
import { useTheme } from "@mui/material/styles";
import Messages from "./components/room/Messages";
import ChatInput from "./components/room/ChatInput";

export default function Room(): React.ReactElement {
    return (
        <RoomContainer>
            <Header />
            <Messages />
            <ChatInput />
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
