import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, Badge, Box, Typography } from "@mui/material";

import { useGetHistoryQuery } from "../api/room";

import { selectUser } from "../../../store/userSlice";
import { selectActiveRoomId } from "../slice/chatSlice";
import { selectHistory } from "../slice/roomSlice";

import useIsInViewport from "../../../hooks/useIsInViewport";

import formatRoomInfo from "../lib/formatRoomInfo";
import MessageType from "../../../types/Message";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { setLeftSidebar } from "../slice/sidebarSlice";

dayjs.extend(relativeTime);
declare const UPLOADS_BASE_URL: string;

export default function SidebarContactList(): React.ReactElement {
    const dispatch = useDispatch();
    const { list, count } = useSelector(selectHistory);
    const [page, setPage] = useState(1);
    const { isFetching } = useGetHistoryQuery(page);
    const { isInViewPort, elementRef } = useIsInViewport();
    const activeRoomId = useSelector(selectActiveRoomId);
    const user = useSelector(selectUser);
    const onChatClick = () => dispatch(setLeftSidebar(false));

    const hasMoreContactsToLoad = count > list.length;

    useEffect(() => {
        if (isInViewPort && !isFetching && hasMoreContactsToLoad) {
            setPage((page) => page + 1);
        }
    }, [isInViewPort, isFetching, hasMoreContactsToLoad]);

    if (!list.length && !isFetching) {
        return <Typography align="center">No rooms</Typography>;
    }

    return (
        <Box sx={{ overflowY: "auto" }}>
            {[...list]
                .sort((a, b) => (a.lastMessage?.createdAt > b.lastMessage?.createdAt ? -1 : 1))
                .map((room) => {
                    const formattedRoom = formatRoomInfo(room, user.id);
                    return (
                        <RoomRow
                            key={room.id}
                            {...formattedRoom}
                            isActive={room.id === activeRoomId}
                            handleClick={onChatClick}
                        />
                    );
                })}
            <div ref={elementRef}></div>
        </Box>
    );
}

type RoomRowProps = {
    id: number;
    name: string;
    isActive: boolean;
    handleClick: () => void;
    unreadCount?: number;
    lastMessage?: MessageType;
    avatarUrl?: string;
};

function RoomRow({
    id,
    isActive,
    name,
    avatarUrl,
    lastMessage,
    handleClick,
    unreadCount,
}: RoomRowProps) {
    let lastMessageText = lastMessage?.body?.text || "No messages";

    if (lastMessageText.length > 25) {
        lastMessageText = lastMessageText.slice(0, 25) + "...";
    }
    return (
        <Link to={`/rooms/${id}`} onClick={handleClick} style={{ textDecoration: "none" }}>
            <Box bgcolor={isActive ? "#E5F4FF" : "#fff"} px={2.5} py={1.5} display="flex">
                <Avatar
                    alt={name}
                    sx={{ width: 50, height: 50 }}
                    src={`${UPLOADS_BASE_URL}${avatarUrl}`}
                />
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    ml={2}
                    flexGrow={1}
                >
                    <Box flexGrow={1}>
                        <Typography
                            mb={1}
                            fontWeight="600"
                            fontSize="0.875rem"
                            lineHeight="1.0625rem"
                        >
                            {name}
                        </Typography>
                        <Typography color="#4A4A4A" fontSize="0.875rem" lineHeight="1.0625rem">
                            {lastMessageText}
                        </Typography>
                    </Box>
                    <Box minWidth="90px" textAlign="right">
                        <Typography
                            mb={1}
                            color="#9AA0A6"
                            fontWeight="500"
                            fontSize="0.75rem"
                            lineHeight="1rem"
                        >
                            {lastMessage?.createdAt && dayjs(lastMessage?.createdAt).fromNow()}
                        </Typography>
                        {unreadCount ? (
                            <Badge
                                sx={{
                                    "& .MuiBadge-badge": {
                                        position: "relative",
                                        transform: "none",
                                    },
                                }}
                                color="primary"
                                badgeContent={unreadCount}
                                max={99}
                            />
                        ) : null}
                    </Box>
                </Box>
            </Box>
        </Link>
    );
}
