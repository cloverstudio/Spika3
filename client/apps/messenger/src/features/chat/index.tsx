import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, Box, Typography, useMediaQuery } from "@mui/material";
import { Call, Search, Videocam } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

import { useGetRoomQuery } from "./api/room";
import { useGetMessagesByRoomIdQuery, useMarkRoomMessagesAsSeenMutation } from "./api/message";

import { selectRoomMessages, setActiveRoomId } from "./slice/chatSlice";
import { selectUser } from "../../store/userSlice";
import { show as showRightSidebar, hide as hideRightSidebar } from "./slice/rightSidebarSlice";

import Loader from "../../components/Loader";

import formatRoomInfo from "./lib/formatRoomInfo";
import useIsInViewport from "../../hooks/useIsInViewport";
import { setLeftSidebar } from "./slice/sidebarSlice";
import ChatInput from "./components/ChatInput";
import Message from "./components/Message";

declare const UPLOADS_BASE_URL: string;
import { RootState } from "../../store/store";

import Confcall from "../confcall";

export default function Chat(): React.ReactElement {
    const roomId = +useParams().id;
    const user = useSelector(selectUser);
    const dispatch = useDispatch();
    const { data, isLoading } = useGetRoomQuery(roomId);
    const [markRoomMessagesAsSeen] = useMarkRoomMessagesAsSeenMutation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const { messages } = useSelector(selectRoomMessages(roomId));

    const room = data?.room;

    useEffect(() => {
        dispatch(setActiveRoomId(roomId));

        return () => {
            dispatch(setActiveRoomId(null));
        };
    }, [dispatch, roomId]);

    useEffect(() => {
        markRoomMessagesAsSeen(roomId);
    }, [dispatch, roomId, markRoomMessagesAsSeen, messages.length]);

    if (isLoading) {
        return <Loader />;
    }

    if (!room) {
        return null;
    }

    const mobileProps = {
        position: "absolute" as const,
        bottom: "0",
        top: "0",
        left: "0",
        right: "0",
    };

    const desktopProps = {
        height: "100vh",
    };

    return (
        <Box display="flex" flexDirection="column" sx={isMobile ? mobileProps : desktopProps}>
            <ChatHeader {...formatRoomInfo(room, user.id)} roomId={roomId} />
            <ChatMessages roomId={roomId} />
            <ChatInput />
        </Box>
    );
}

type ChatHeaderProps = {
    name: string;
    avatarUrl: string;
    roomId: number;
};

function ChatHeader({ name, avatarUrl, roomId }: ChatHeaderProps): React.ReactElement {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const dispatch = useDispatch();
    const rightSidebarState = useSelector((state: RootState) => state.rightSidebar);
    const [showConfcall, setShowConfcall] = useState<boolean>(false);
    const me = useSelector(selectUser);

    return (
        <Box px={2} borderBottom="0.5px solid #C9C9CA">
            <Box display="flex" justifyContent="space-between" height="80px">
                <Box
                    display="flex"
                    alignItems="center"
                    sx={{ cursor: "pointer" }}
                    onClick={(e) => {
                        if (!rightSidebarState.isOpened) dispatch(showRightSidebar());
                        else dispatch(hideRightSidebar());
                    }}
                >
                    {isMobile && (
                        <ChevronLeftIcon
                            sx={{ mr: 0.5 }}
                            onClick={() => dispatch(setLeftSidebar(true))}
                            fontSize="large"
                        />
                    )}
                    <Avatar alt={name} src={`${UPLOADS_BASE_URL}${avatarUrl}`} />

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
                            onClick={(e) => {
                                setShowConfcall(true);
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
                            onClick={(e) => {
                                setShowConfcall(true);
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

            {showConfcall ? (
                <>
                    <Confcall
                        roomId={`${roomId}`}
                        userId={`${me.id}`}
                        userName={me.displayName}
                        onClose={() => {
                            setShowConfcall(false);
                        }}
                    />
                </>
            ) : null}
        </Box>
    );
}

type ChatMessagesProps = {
    roomId: number;
};

function ChatMessages({ roomId }: ChatMessagesProps): React.ReactElement {
    const user = useSelector(selectUser);
    const ref = useRef<HTMLBaseElement>();
    const { messages, count } = useSelector(selectRoomMessages(roomId));
    const [page, setPage] = useState(1);
    const [scrollTop, setScrollTop] = useState(null);
    const [scrollListenerSet, setScrollListener] = useState(false);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const { isFetching } = useGetMessagesByRoomIdQuery({ roomId, page });
    const hasMoreContactsToLoad = count > messages.length;

    const { isInViewPort, elementRef } = useIsInViewport();

    useEffect(() => {
        if (scrollListenerSet && isInViewPort && !isFetching && hasMoreContactsToLoad) {
            setPage((page) => page + 1);
            if (shouldAutoScroll) {
                const elem = ref.current;
                elem.scroll({
                    top: elem.scrollHeight,
                });
            }
        }
    }, [isInViewPort, isFetching, hasMoreContactsToLoad, scrollListenerSet, shouldAutoScroll]);

    useEffect(() => {
        const handleScroll = (e: HTMLBaseElement) => {
            setScrollTop((scrollTop: any) => {
                if (e.scrollTop < scrollTop) {
                    setShouldAutoScroll(false);
                }

                if (e.offsetHeight + e.scrollTop === e.scrollHeight) {
                    setShouldAutoScroll(true);
                }

                return e.scrollTop;
            });
        };

        if (ref && ref.current && !scrollListenerSet) {
            const elem = ref.current;

            elem.addEventListener("scroll", () => handleScroll(elem));
            setScrollListener(true);
            return () => {
                elem.removeEventListener("scroll", () => handleScroll(elem));
            };
        }
    }, [scrollTop, scrollListenerSet]);

    useEffect(() => {
        const elem = ref.current;
        if (messages.length && shouldAutoScroll && scrollListenerSet && ref && ref.current) {
            elem.scroll({
                top: elem.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages.length, shouldAutoScroll, scrollListenerSet]);

    useEffect(() => {
        return () => {
            setPage(1);
        };
    }, [roomId]);

    const messagesSorted = messages.sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));

    return (
        <Box
            flexGrow={1}
            display="flex"
            flexDirection="column"
            justifyContent="end"
            sx={{ overflowY: "hidden" }}
        >
            <Box px={1} sx={{ overflowY: "auto" }} ref={ref}>
                <div ref={elementRef} />
                {messagesSorted.map((m, i) => (
                    <Message
                        key={m.id}
                        {...m}
                        nextMessageSenderId={messagesSorted[i + 1]?.fromUserId}
                        previousMessageSenderId={messagesSorted[i - 1]?.fromUserId}
                    />
                ))}
            </Box>
        </Box>
    );
}
