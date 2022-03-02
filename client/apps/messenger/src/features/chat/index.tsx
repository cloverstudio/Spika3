import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, Box, Input, Typography } from "@mui/material";
import { Call, Search, Videocam } from "@mui/icons-material";
import CheckIcon from "@mui/icons-material/Check";

import { useGetRoomQuery } from "./api/room";
import { useGetMessagesByRoomIdQuery, useSendMessageMutation } from "./api/message";

import { selectRoomMessages, setActiveRoomId } from "./slice/chatSlice";
import { selectUser } from "../../store/userSlice";

import Loader from "../../components/Loader";

import formatRoomInfo from "./lib/formatRoomInfo";
import useIsInViewport from "../../hooks/useIsInViewport";

export default function Chat(): React.ReactElement {
    const roomId = +useParams().id;
    const user = useSelector(selectUser);
    const dispatch = useDispatch();
    const [sendMessage] = useSendMessageMutation();
    const { data, isLoading } = useGetRoomQuery(roomId);
    const room = data?.room;

    const onSend = (message: string) => {
        sendMessage({ message: { text: message }, roomId: room.id, type: "text" });
    };

    useEffect(() => {
        dispatch(setActiveRoomId(roomId));

        return () => {
            dispatch(setActiveRoomId(null));
        };
    }, [dispatch, roomId]);

    if (isLoading) {
        return <Loader />;
    }

    if (!room) {
        return null;
    }

    return (
        <Box display="flex" flexDirection="column" height="100vh">
            <ChatHeader {...formatRoomInfo(room, user.id)} />
            <ChatMessages roomId={roomId} />
            <ChatInput handleSend={onSend} />
        </Box>
    );
}

type ChatHeaderProps = {
    name: string;
    avatarUrl: string;
};

function ChatHeader({ name, avatarUrl }: ChatHeaderProps): React.ReactElement {
    return (
        <Box px={2} borderBottom="0.5px solid #C9C9CA">
            <Box display="flex" justifyContent="space-between" height="80px">
                <Box display="flex" alignItems="center">
                    <Avatar alt={name} src={avatarUrl} />

                    <Typography fontWeight="500" fontSize="1rem" ml={1.5}>
                        {name}
                    </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                    <Box mr={3}>
                        <Videocam
                            sx={{
                                fontSize: "28px",
                                color: "#4696F0",
                                cursor: "pointer",
                            }}
                        />
                    </Box>
                    <Box mr={3}>
                        <Call
                            sx={{
                                fontSize: "28px",
                                color: "#4696F0",
                                cursor: "pointer",
                            }}
                        />
                    </Box>
                    <Box>
                        <Search
                            sx={{
                                fontSize: "28px",
                                color: "#4696F0",
                                cursor: "pointer",
                            }}
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

type ChatMessagesProps = {
    roomId: number;
};

function ChatMessages({ roomId }: ChatMessagesProps): React.ReactElement {
    const user = useSelector(selectUser);
    const { messages, count } = useSelector(selectRoomMessages(roomId));
    const [page, setPage] = useState(1);
    const { isFetching } = useGetMessagesByRoomIdQuery({ roomId, page });

    const hasMoreContactsToLoad = count > messages.length;

    const { isInViewPort, elementRef } = useIsInViewport();

    useEffect(() => {
        if (isInViewPort && !isFetching && hasMoreContactsToLoad) {
            setPage((page) => page + 1);
        }
    }, [isInViewPort, isFetching, hasMoreContactsToLoad]);

    useEffect(() => {
        return () => {
            setPage(1);
        };
    }, [roomId]);

    return (
        <Box
            flexGrow={1}
            display="flex"
            flexDirection="column"
            justifyContent="end"
            sx={{ overflowY: "hidden" }}
        >
            <Box px={4} sx={{ overflowY: "auto" }}>
                <div ref={elementRef} />
                {messages
                    .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
                    .map((m) => {
                        const isUsersMessage = user?.id === m.fromUserId;
                        return (
                            <Box
                                key={m.id}
                                display="flex"
                                flexDirection="column"
                                alignItems={isUsersMessage ? "end" : "start"}
                                textAlign={isUsersMessage ? "right" : "left"}
                            >
                                <Box
                                    maxWidth="35rem"
                                    bgcolor={isUsersMessage ? "#C8EBFE" : "#F2F2F2"}
                                    borderRadius="0.625rem"
                                    p="0.625rem"
                                    pb="0.8125"
                                    mb="0.375rem"
                                >
                                    <Typography
                                        fontWeight={500}
                                        fontSize="0.875rem"
                                        color="#131940"
                                        lineHeight="1,0625rem"
                                    >
                                        {m.messageBody.text}
                                    </Typography>
                                </Box>
                                {isUsersMessage && (
                                    <CheckIcon
                                        sx={{
                                            width: "0.75rem",
                                            height: "auto",
                                            color: "#5F6368",
                                            mb: "0.375rem",
                                            mr: "0.125rem",
                                        }}
                                    />
                                )}
                            </Box>
                        );
                    })}
            </Box>
        </Box>
    );
}

type ChatInputProps = {
    handleSend: (message: string) => void;
};

function ChatInput({ handleSend }: ChatInputProps): React.ReactElement {
    const [message, setMessage] = useState("");

    return (
        <Box
            minHeight="80px"
            borderTop="0.5px solid #C9C9CA"
            display="flex"
            alignItems="center"
            px={2}
        >
            <Input
                disableUnderline={true}
                fullWidth
                value={message}
                onChange={({ target }) => setMessage(target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        handleSend(message);
                        setMessage("");
                    }
                }}
                placeholder="Type here..."
                sx={{
                    backgroundColor: "#fff",
                    border: "1px solid #C9C9CA",
                    input: {
                        py: 2,
                        px: 1.5,
                    },
                }}
            />
        </Box>
    );
}
