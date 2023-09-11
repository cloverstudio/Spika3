import React, { Dispatch, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import { Box, CircularProgress, IconButton, Skeleton } from "@mui/material";
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
import SearchBox from "../SearchBox";
import Add from "@mui/icons-material/AddOutlined";
import NotificationsOff from "@mui/icons-material/NotificationsOff";
import Pin from "@mui/icons-material/PushPin";
import useStrings from "../../../../hooks/useStrings";
import { useGetRoomQuery } from "../../api/room";
import formatRoomInfo from "../../lib/formatRoomInfo";
import { selectUser } from "../../../../store/userSlice";

dayjs.extend(relativeTime);
declare const UPLOADS_BASE_URL: string;

export default function SidebarChatList({
    isMobile,
    setSidebar,
}: {
    isMobile: boolean;
    setSidebar: Dispatch<React.SetStateAction<string>>;
}): React.ReactElement {
    const strings = useStrings();
    const dispatch = useDispatch();
    const activeRoomId = parseInt(useParams().id || "");

    const list = useSelector(selectHistory);
    const loading = useSelector(selectHistoryLoading());

    const { isInViewPort, elementRef } = useIsInViewport();

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

    const searchBoxProps = !isMobile
        ? {
              display: "flex",
              marginBottom: "20px",
          }
        : {};

    return (
        <Box sx={{ overflowY: "auto", maxHeight: "100%" }}>
            <Box sx={{ ...searchBoxProps }}>
                <SearchBox
                    isMobile={isMobile}
                    marginBottom={isMobile ? 2 : 0}
                    onSearch={(keyword) => {
                        dispatch(setKeyword(keyword));
                        dispatch(fetchHistory());
                    }}
                />
                {!isMobile && (
                    <Box marginLeft="-10px">
                        <IconButton onClick={() => setSidebar("new_chat")}>
                            <Add
                                fontSize="large"
                                sx={{
                                    width: "25px",
                                    height: "25px",
                                    color: "text.navigation",
                                    cursor: "pointer",
                                }}
                            />
                        </IconButton>
                    </Box>
                )}
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
    isActive?: boolean;
};

function RoomRow({ id, isActive, lastMessage, unreadCount }: RoomRowProps) {
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

    if (isLoading) {
        return (
            <Link to={`/rooms/${id}`} style={{ textDecoration: "none" }}>
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
    }

    if (!data) {
        return null;
    }

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
        <Link to={`/rooms/${id}`} style={{ textDecoration: "none" }}>
            <Box
                bgcolor={isActive ? "action.hover" : "transparent"}
                px={2.5}
                py={1.5}
                display="flex"
                id={`room_${id}`}
            >
                <Avatar
                    alt={name}
                    sx={{ width: 50, height: 50 }}
                    src={`${UPLOADS_BASE_URL}/${avatarFileId}`}
                />
                <Box ml={2} flexGrow={1} overflow="hidden">
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="baseline"
                        gap={1}
                        overflow="hidden"
                        mb={0.5}
                    >
                        <Typography
                            fontWeight="600"
                            color="text.primary"
                            sx={{
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                            }}
                        >
                            {name}
                        </Typography>

                        <Typography
                            fontSize="small"
                            color="text.tertiary"
                            fontWeight="500"
                            lineHeight="1rem"
                            flexShrink={0}
                        >
                            {time === "a few seconds ago" ? strings.now : time}
                        </Typography>
                    </Box>

                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="baseline"
                        gap={1}
                    >
                        <Typography
                            sx={{
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                            }}
                            color="text.secondary"
                            lineHeight="1.35rem"
                        >
                            {lastMessageText}
                        </Typography>

                        <Box
                            display="flex"
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
