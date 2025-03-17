import React, { Dispatch, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import { Box, CircularProgress, IconButton, Skeleton, Stack, useMediaQuery } from "@mui/material";
import CameraIcon from "@mui/icons-material/CameraAltRounded";
import VideocamIcon from "@mui/icons-material/VideocamRounded";
import DocumentIcon from "@mui/icons-material/Description";
import Typography from "@mui/material/Typography";
import {
    fetchHistory,
    selectCurrentKeyword,
    selectHistory,
    selectHistoryLoading,
    setCurrentKeyword,
    setKeyword,
} from "../../slices/leftSidebar";

import useIsInViewport from "../../../../hooks/useIsInViewport";

import MessageType from "../../../../types/Message";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ControlledSearchBox } from "../SearchBox";
import NotificationsOff from "@mui/icons-material/NotificationsOff";
import Pin from "@mui/icons-material/PushPin";
import { useTranslation } from "react-i18next";
import { useAcceptCallMutation, useGetOngoingCallsQuery, useGetRoomQuery } from "../../api/room";
import formatRoomInfo from "../../lib/formatRoomInfo";
import { selectUser } from "../../../../store/userSlice";
import { useTheme } from "@mui/material/styles";
import { ReactComponent as NewChatIcon } from "../../../../assets/new-chat.svg";
import { AppDispatch } from "../../../../store/store";
import { useAppDispatch, useAppSelector } from "../../../../hooks";
import { showNoteEditModal } from "../../slices/rightSidebar";
import { Call, Videocam } from "@mui/icons-material";
import { openCallIframe, selectCallData } from "../../slices/callIframe";
import { User } from "@prisma/client";

dayjs.extend(relativeTime);
declare const UPLOADS_BASE_URL: string;

export default function SidebarChatList({
    setSidebar,
}: {
    setSidebar: Dispatch<React.SetStateAction<string>>;
}): React.ReactElement {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const activeRoomId = parseInt(useParams().id || "");

    const list = useSelector(selectHistory);
    const loading = useSelector(selectHistoryLoading());
    const currentKeyword = useSelector(selectCurrentKeyword);

    const ongoingCalls = useGetOngoingCallsQuery();
    const callIframeData = useSelector(selectCallData);

    const [acceptCall] = useAcceptCallMutation();

    const { isInViewPort, elementRef } = useIsInViewport();

    const isFetching = loading === "pending";

    const theme = useTheme();

    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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
            a.lastMessage?.createdAt > b.lastMessage?.createdAt ? -1 : 1,
        );

        const pinned = sorted.filter((r) => r.pinned);
        return [...pinned, ...sorted.filter((r) => !r.pinned)];
    };

    const searchBoxProps = !isMobile
        ? {
              display: "flex",
              marginBottom: "20px",
              width: "96%",
          }
        : {};

    const handleJoinCall = async (enableCamera: boolean, roomId: number) => {
        if (callIframeData.showCallIframe && callIframeData.roomId === roomId) return;

        try {
            await acceptCall({ roomId }).unwrap();
            dispatch(
                openCallIframe({
                    roomId,
                    enableCamera,
                }),
            );
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Box height="100%">
            <Box sx={{ ...searchBoxProps }}>
                <ControlledSearchBox
                    keyword={currentKeyword}
                    setKeyword={(keyword) => {
                        dispatch(setCurrentKeyword(keyword));
                    }}
                    marginBottom={isMobile ? 2 : 0}
                    onSearch={(keyword) => {
                        dispatch(setKeyword(keyword));
                        dispatch(fetchHistory());
                    }}
                />
                {!isMobile && (
                    <Box>
                        <IconButton
                            onClick={() => setSidebar("new_chat")}
                            sx={{
                                "&:hover": {
                                    bgcolor: theme.palette.mode === "dark" ? "#000000" : "default",
                                },
                                borderRadius: "10px",
                            }}
                        >
                            <NewChatIcon
                                style={{
                                    fill: theme.palette.mode === "dark" ? "#0078FF" : "#4696F0",
                                }}
                            />
                        </IconButton>
                    </Box>
                )}
            </Box>

            {ongoingCalls.data?.length > 0 && (
                <Box
                    sx={{
                        borderBottom: "1px solid",
                        borderColor: "primary.main",
                        pb: 1,
                    }}
                >
                    <Typography
                        sx={{
                            px: 2.5,
                            mt: 2,
                            mb: 1,
                            fontWeight: 600,
                            textAlign: "center",
                            color: "primary.main",
                        }}
                    >
                        {t("callsInProgress", {
                            count: ongoingCalls.data.length,
                        })}
                    </Typography>
                    {ongoingCalls.data.map((call) => {
                        return (
                            <OngoingCallsRow
                                key={call.id}
                                call={call}
                                handleJoinCall={handleJoinCall}
                            />
                        );
                    })}
                </Box>
            )}

            <Box sx={{ overflowY: "auto", height: "calc(100% - 45px)" }}>
                {list.length === 0 && !isFetching && (
                    <Typography align="center">{t("noRooms")}</Typography>
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
    const { t } = useTranslation();
    const me = useSelector(selectUser);
    const [time, setTime] = useState(
        lastMessage?.createdAt && dayjs(lastMessage.createdAt).fromNow(),
    );
    const { data, isLoading } = useGetRoomQuery(id);

    const navigate = useNavigate();

    const dispatch = useAppDispatch();

    const isSomeNoteEditing =
        useAppSelector((state) => state.rightSidebar.activeTab) === "editNote";

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

    let lastMessageText = <LastMessageText lastMessage="" />;

    const senderUser = users.find((u) => u.userId === lastMessage?.fromUserId)?.user;
    const sender = type === "group" ? `${senderUser?.displayName || t("removedUser")}` : undefined;

    if (lastMessage && lastMessageType !== "text") {
        if (lastMessageType === "image") {
            lastMessageText = (
                <LastMessageText
                    sender={sender}
                    lastMessage={t("photo")}
                    icon={<CameraIcon sx={{ width: "20px", color: "text.tertiary" }} />}
                />
            );
        }
        if (lastMessageType === "video") {
            lastMessageText = (
                <LastMessageText
                    sender={sender}
                    lastMessage={t("video")}
                    icon={<VideocamIcon sx={{ width: "20px", color: "text.tertiary" }} />}
                />
            );
        }
        if (lastMessageType === "file") {
            lastMessageText = (
                <LastMessageText
                    sender={sender}
                    lastMessage={t("document")}
                    icon={<DocumentIcon sx={{ width: "20px", color: "text.tertiary" }} />}
                />
            );
        }
        if (lastMessageType === "system") {
            lastMessageText = <LastMessageText lastMessage={lastMessage?.body?.text} />;
        }
    } else if (lastMessageType === "text") {
        lastMessageText = <LastMessageText sender={sender} lastMessage={lastMessage?.body?.text} />;
    }

    const roomClickHandler = () => {
        if (isSomeNoteEditing) {
            dispatch(showNoteEditModal());
            return;
        }

        navigate(`/rooms/${id}`);
    };

    return (
        <Box
            bgcolor={isActive ? "action.hover" : "transparent"}
            px={2.5}
            py={1.5}
            display="flex"
            id={`room_${id}`}
            sx={{
                "&:hover": {
                    cursor: "pointer",
                },
            }}
            onClick={roomClickHandler}
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
                        {time === "a few seconds ago" ? t("now") : time}
                    </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="baseline" gap={1}>
                    <Box
                        sx={{
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                        }}
                        color="text.secondary"
                        lineHeight="1.35rem"
                    >
                        {lastMessageText}
                    </Box>

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
    );
}

interface LastMessageTextProps {
    lastMessage: string;
    icon?: React.ReactElement;
    sender?: string;
}

function LastMessageText({ lastMessage, icon, sender }: LastMessageTextProps) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: " 4px" }}>
            {sender && <Typography fontSize="14px">{sender}: </Typography>}
            {icon && icon}
            <Typography fontSize="14px">{lastMessage}</Typography>
        </Box>
    );
}

interface OngoingCallsRowProps {
    call: {
        id: number;
        roomId: number;
        startedAt: Date;
        finishedAt: Date | null;
        participants: { user: User }[];
        room: {
            id: number;
            name: string;
            type: string;
            avatarFileId: number;
        };
    };
    handleJoinCall: (enableCamera: boolean, roomId: number) => void;
}

function OngoingCallsRow({ call, handleJoinCall }: OngoingCallsRowProps) {
    const me = useSelector(selectUser);
    const { t } = useTranslation();

    const { roomName, avatarFileId } = useMemo(() => {
        const isGroup = call.room.type === "group";
        const participant = call.participants.find((p) => p.user.id !== me.id);

        return {
            roomName: isGroup ? call.room.name : participant?.user.displayName,
            avatarFileId: isGroup ? call.room.avatarFileId : participant?.user.avatarFileId,
        };
    }, [call, me.id]);

    const iconSxProps = {
        width: "25px",
        height: "25px",
        color: "primary.main",
        cursor: "pointer",
        "&:hover": {
            backgroundColor: "transparent",
        },
    };

    return (
        <Box px={2.5} py={1.5} display="flex">
            <Avatar
                alt={roomName}
                sx={{ width: 50, height: 50 }}
                src={`${UPLOADS_BASE_URL}/${avatarFileId}`}
            />

            <Box ml={2} maxWidth="45%" display="flex" alignItems="center" pr={1}>
                <Typography
                    fontWeight="600"
                    color="text.primary"
                    sx={{
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 2,
                        lineClamp: 2,
                        wordBreak: "break-word",
                    }}
                >
                    {roomName}
                </Typography>
            </Box>
            <Box
                flexGrow={1}
                sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: "8px",
                }}
            >
                <Typography
                    sx={{
                        fontSize: "12px",
                        fontWeight: 500,
                    }}
                >
                    {t("join")}:
                </Typography>
                <Stack direction="row" justifyContent="center" gap="8px">
                    <IconButton
                        sx={iconSxProps}
                        onClick={() => handleJoinCall(false, call.room.id)}
                    >
                        <Call />
                    </IconButton>
                    <IconButton sx={iconSxProps} onClick={() => handleJoinCall(true, call.room.id)}>
                        <Videocam />
                    </IconButton>
                </Stack>
            </Box>
        </Box>
    );
}
