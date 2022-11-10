import React, { useEffect, useRef } from "react";

import { Box, useMediaQuery } from "@mui/material";
import Header from "./components/room/Header";
import { useTheme } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import { selectInputText, setInputText } from "./slices/input";
import { useParams } from "react-router-dom";
import { sendMessage } from "./slices/messages";
import MessagesList from "./components/room/MessagesList";
import ChatInput from "./components/room/ChatInput";

export default function Room(): React.ReactElement {
    return (
        <RoomContainer>
            <Header />
            <MessagesList />
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
