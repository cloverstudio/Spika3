import React, { useEffect, useRef } from "react";

import { Box, useMediaQuery } from "@mui/material";
import Header from "./components/room/Header";
import { useTheme } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import { selectInputText, sendMessage, setInputText } from "./slices/input";
import { useParams } from "react-router-dom";
import { fetchMessages, selectRoomMessages, selectRoomMessagesIsLoading } from "./slices/messages";

export default function Room(): React.ReactElement {
    return (
        <RoomContainer>
            <Header />
            <RoomMessages />
            <Input />
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

function RoomMessages() {
    const roomId = parseInt(useParams().id || "");

    const dispatch = useDispatch();
    const messages = useSelector(selectRoomMessages(roomId));
    const isLoading = useSelector(selectRoomMessagesIsLoading(roomId));

    useEffect(() => {
        dispatch(fetchMessages({ roomId }));
    }, [dispatch, roomId]);

    return (
        <Box
            flexGrow={1}
            display="flex"
            flexDirection="column"
            justifyContent="end"
            position="relative"
            sx={{ overflowY: "hidden" }}
        >
            {messages.map((m) => (
                <Box key={m.id}>{m.body.text}</Box>
            ))}
        </Box>
    );
}

function Input() {
    const roomId = parseInt(useParams().id || "");
    const ref = useRef<HTMLTextAreaElement>();

    const dispatch = useDispatch();
    const text = useSelector(selectInputText(roomId));

    useEffect(() => {
        ref.current.focus();
    });

    const handleChange = (text: string) => {
        dispatch(setInputText({ text, roomId }));
    };

    const handleSend = () => {
        dispatch(sendMessage(roomId));
    };

    return (
        <Box borderTop="1px solid #C9C9CA" px={2} py={1}>
            <textarea
                ref={ref}
                value={text}
                //   disabled={loading}
                onChange={({ target }) => {
                    handleChange(target.value);
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && e.shiftKey === true) {
                        handleChange(e.currentTarget.value);
                    } else if (e.key === "Enter") {
                        e.preventDefault();
                        handleSend();
                    } else {
                    }
                }}
                placeholder="Type here..."
                style={{
                    border: "none",
                    padding: "10px",
                    display: "block",
                    width: "100%",
                    outline: "none",
                    fontSize: "0.9em",
                    paddingRight: "32px",
                    resize: "vertical",
                }}
                rows={1}
            />
        </Box>
    );
}
