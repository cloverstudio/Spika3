import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import { Box, CircularProgress, Skeleton } from "@mui/material";
import Typography from "@mui/material/Typography";
import {
    fetchHistory,
    selectHistory,
    selectHistoryLoading,
    setKeyword,
} from "../../slices/leftSidebar";

import useIsInViewport from "../../../../hooks/useIsInViewport";

import MessageType from "../../../../types/Message";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { setLeftSidebar } from "../../slices/leftSidebar";
import SearchBox from "../SearchBox";
import NotificationsOff from "@mui/icons-material/NotificationsOff";
import Pin from "@mui/icons-material/PushPin";
import useStrings from "../../../../hooks/useStrings";
import { useGetRoomQuery } from "../../api/room";
import formatRoomInfo from "../../lib/formatRoomInfo";
import { selectUser } from "../../../../store/userSlice";

dayjs.extend(relativeTime);
declare const UPLOADS_BASE_URL: string;

export default function SidebarChatList(): React.ReactElement {
    const strings = useStrings();
    const dispatch = useDispatch();
    const activeRoomId = parseInt(useParams().id || "");

    const list = useSelector(selectHistory);
    const loading = useSelector(selectHistoryLoading());

    const { isInViewPort, elementRef } = useIsInViewport();
    const onChatClick = () => dispatch(setLeftSidebar(false));
    const isFetching = loading === "pending";

    useEffect(() => {
        if (isInViewPort) {
            dispatch(fetchHistory());
        }
    }, [dispatch, isInViewPort]);

    useEffect(() => {
        return () => {
            dispatch(setKeyword(""));
            dispatch(fetchHistory());
        };
    }, [dispatch]);

    const sortRooms = (): typeof list => {
        const sorted = [...list].sort((a, b) =>
            a.lastMessage?.createdAt > b.lastMessage?.createdAt ? -1 : 1
        );

        const pinned = sorted.filter((r) => r.pinned);
        return [...pinned, ...sorted.filter((r) => !r.pinned)];
    };

    return (
        <Box sx={{ overflowY: "auto", maxHeight: "100%" }}>
            <Box mt={3}>
                <SearchBox
                    onSearch={(keyword) => {
                        dispatch(setKeyword(keyword));
                        dispatch(fetchHistory());
                    }}
                />
            </Box>

            {list.length === 0 && !isFetching && (
                <Typography align="center">{strings.noRooms}</Typography>
            )}

            {sortRooms().map(({ roomId, unreadCount, lastMessage }) => {
                return (
                    <RoomRow
                        key={roomId}
                        id={roomId}
                        lastMessage={lastMessage}
                        unreadCount={unreadCount}
                        isActive={roomId === activeRoomId}
                        handleClick={onChatClick}
                    />
                );
            })}

            <Box textAlign="center" height="50px" ref={elementRef}>
                {isFetching && <CircularProgress />}
            </Box>
        </Box>
    );
}

type RoomRowProps = {
    id: number;
    unreadCount: number;
    lastMessage: MessageType;
    handleClick: () => void;
    isActive?: boolean;
};

function RoomRow({ id, isActive, lastMessage, handleClick, unreadCount }: RoomRowProps) {
    const strings = useStrings();
    const me = useSelector(selectUser);
    const [time, setTime] = useState(
        lastMessage?.createdAt && dayjs(lastMessage.createdAt).fromNow()
    );
    const { data, isLoading } = useGetRoomQuery(id);

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

    if (isLoading)
        return (
            <Link to={`/rooms/${id}`} onClick={handleClick} style={{ textDecoration: "none" }}>
                <Box
                    bgcolor={isActive ? "action.hover" : "transparent"}
                    px={2.5}
                    py={1.5}
                    display="flex"
                >
                    <Skeleton width={50} height={50} variant="circular" />
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        ml={2}
                        flexGrow={1}
                        overflow="hidden"
                    >
                        <Box flexGrow={1} overflow="hidden" mr={12}>
                            <Skeleton sx={{ mb: 1, mr: 3 }} />

                            <Skeleton height="1.125rem" />
                        </Box>
                    </Box>
                </Box>
            </Link>
        );

    const room = formatRoomInfo(data, me.id);
    const { name, users, avatarFileId, type, muted, pinned } = room;
    const lastMessageType = lastMessage?.type;

    let lastMessageText = lastMessage?.body?.text;

    if (lastMessage && lastMessageType !== "text") {
        lastMessageText = (lastMessageType || "") + " " + strings.shared;
        lastMessageText = lastMessageText.charAt(0).toUpperCase() + lastMessageText.slice(1);
    }

    if (lastMessageText && type === "group") {
        const senderUser = users.find((u) => u.userId === lastMessage.fromUserId)?.user;
        lastMessageText = `${senderUser?.displayName || strings.removedUser}: ${lastMessageText}`;
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
                    src={`${UPLOADS_BASE_URL}/${avatarFileId}`}
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
                        <Typography mb={1} fontWeight="600" color="text.primary">
                            {name}
                        </Typography>
                        <Typography
                            sx={{
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                            }}
                            color="text.secondary"
                            lineHeight="1.125rem"
                        >
                            {lastMessageText}
                        </Typography>
                    </Box>
                    <Box
                        minWidth="90px"
                        height="100%"
                        display="flex"
                        justifyContent="space-between"
                        flexDirection="column"
                        textAlign="right"
                    >
                        <Typography
                            fontSize="small"
                            color="text.tertiary"
                            fontWeight="500"
                            lineHeight="1rem"
                        >
                            {time === "a few seconds ago" ? strings.now : time}
                        </Typography>
                        <Box
                            display="flex"
                            mt={1}
                            justifyContent="end"
                            alignItems="center"
                            gap={1}
                            color="text.primary"
                        >
                            {muted && <NotificationsOff fontSize="inherit" />}
                            {pinned && <Pin fontSize="inherit" />}
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
            </Box>
        </Link>
    );
}
