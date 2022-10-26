import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, Badge, Box, Typography } from "@mui/material";
import { isRoomMuted, selectUser } from "../../../store/userSlice";
import { selectActiveRoomId } from "../slice/chatSlice";
import { fetchHistory, selectHistory, selectHistoryLoading } from "../slice/roomSlice";

import useIsInViewport from "../../../hooks/useIsInViewport";

import formatRoomInfo from "../lib/formatRoomInfo";
import MessageType from "../../../types/Message";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { setLeftSidebar } from "../slice/sidebarSlice";
import SearchBox from "./SearchBox";
import { RoomUserType } from "../../../types/Rooms";
import { VolumeOffOutlined } from "@mui/icons-material";

dayjs.extend(relativeTime);
declare const UPLOADS_BASE_URL: string;

export default function SidebarChatList(): React.ReactElement {
    const dispatch = useDispatch();

    const { list, count } = useSelector(selectHistory, (bfr, aft) => false);
    const loading = useSelector(selectHistoryLoading(), (bfr, aft) => true);
    const activeRoomId = useSelector(selectActiveRoomId, (bfr, aft) => false);
    const user = useSelector(selectUser, (bfr, aft) => true);

    const [page, setPage] = useState(1);
    const { isInViewPort, elementRef } = useIsInViewport();
    const onChatClick = () => dispatch(setLeftSidebar(false));
    const isFetching = loading !== "idle";
    const [keyword, setKeyword] = useState<string>("");

    const hasMoreContactsToLoad = count > list.length;

    useEffect(() => {
        dispatch(fetchHistory({ page: page, keyword }));
    }, [dispatch, page]);

    // user changes keyword => reset page to 1 => do search
    useEffect(() => {
        if (page === 1) dispatch(fetchHistory({ page: 1, keyword }));
        else setPage(1);
    }, [keyword]);

    useEffect(() => {
        if (isInViewPort && !isFetching && hasMoreContactsToLoad) {
            setPage((page) => page + 1);
        }
    }, [isInViewPort, isFetching, hasMoreContactsToLoad]);

    return (
        <Box sx={{ overflowY: "auto", maxHeight: "100%" }}>
            <Box mt={3}>
                <SearchBox
                    onSearch={(keyword: string) => {
                        setKeyword(keyword);
                    }}
                />
            </Box>

            {list.length === 0 && !isFetching ? (
                <Typography align="center">No rooms</Typography>
            ) : (
                <>
                    {[...list]
                        .sort((a, b) =>
                            a.lastMessage?.createdAt > b.lastMessage?.createdAt ? -1 : 1
                        )
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
                </>
            )}

            <div ref={elementRef}></div>
        </Box>
    );
}

type RoomRowProps = {
    id: number;
    name: string;
    type: string;
    isActive?: boolean;
    handleClick: () => void;
    unreadCount?: number;
    lastMessage?: MessageType;
    avatarUrl?: string;
    users: RoomUserType[];
};

function RoomRow({
    id,
    isActive,
    name,
    avatarUrl,
    lastMessage,
    handleClick,
    unreadCount,
    type,
    users,
}: RoomRowProps) {
    const roomIsMuted = useSelector(isRoomMuted(id));
    const [time, setTime] = useState(
        lastMessage?.createdAt && dayjs(lastMessage.createdAt).fromNow()
    );

    useEffect(() => {
        if (lastMessage?.createdAt) {
            setTime(dayjs(lastMessage.createdAt).fromNow());

            const interval = setInterval(() => {
                setTime(dayjs(lastMessage.createdAt).fromNow());
            }, 1000);

            return () => {
                clearInterval(interval);
            };
        }
    }, [lastMessage]);

    const lastMessageType = lastMessage?.type;

    let lastMessageText = lastMessage?.body?.text;

    if (lastMessage && lastMessageType !== "text") {
        lastMessageText = (lastMessageType || "") + " shared";
        lastMessageText = lastMessageText.charAt(0).toUpperCase() + lastMessageText.slice(1);
    }

    if (lastMessageText && type === "group") {
        const senderUser = users.find((u) => u.userId === lastMessage.fromUserId)?.user;
        lastMessageText = `${senderUser?.displayName || "Removed user"}: ${lastMessageText}`;
    }

    return (
        <Link to={`/rooms/${id}`} onClick={handleClick} style={{ textDecoration: "none" }}>
            <Box
                bgcolor={isActive ? "action.hover" : "transparent"}
                px={2.5}
                py={1.5}
                display="flex"
            >
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
                    overflow="hidden"
                >
                    <Box flexGrow={1} overflow="hidden">
                        <Typography mb={1} fontWeight="600">
                            {name}
                            {roomIsMuted && (
                                <Box component="span" display="inline-flex" ml={1}>
                                    <VolumeOffOutlined fontSize="inherit" />
                                </Box>
                            )}
                        </Typography>
                        <Typography
                            sx={{
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                            }}
                            color="text.secondary"
                            lineHeight="1.0625rem"
                        >
                            {lastMessageText}
                        </Typography>
                    </Box>
                    <Box minWidth="90px" textAlign="right">
                        <Typography
                            fontSize="small"
                            color="text.tertiary"
                            fontWeight="500"
                            lineHeight="1rem"
                        >
                            {time === "a few seconds ago" ? "now" : time}
                        </Typography>
                        {unreadCount ? (
                            <Badge
                                sx={{
                                    mt: 1,
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
