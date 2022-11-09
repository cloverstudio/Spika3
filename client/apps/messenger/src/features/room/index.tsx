import React, { useEffect, useMemo, useRef, useState } from "react";

import { Box, useMediaQuery } from "@mui/material";
import Header from "./components/room/Header";
import { useTheme } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import { selectInputText, setInputText } from "./slices/input";
import { useParams } from "react-router-dom";
import {
    canLoadMoreMessages,
    fetchMessages,
    selectMessageById,
    selectRoomMessages,
    selectRoomMessagesIsLoading,
    selectRoomSendingMessages,
    sendMessage,
} from "./slices/messages";
import { selectUser } from "../../store/userSlice";
import dayjs from "dayjs";
import MessageType from "../../types/Message";

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

const Message = React.memo(function Message({ id }: { id: number }) {
    const roomId = parseInt(useParams().id || "");
    const user = useSelector(selectUser);

    const message = useSelector(selectMessageById(roomId, id));

    if (!message) {
        return null;
    }
    console.log("message rendr");

    const isUserMessage = message.fromUserId === user.id;
    return (
        <Box
            maxWidth="80%"
            textAlign={isUserMessage ? "left" : "right"}
            sx={{
                ...(isUserMessage
                    ? {
                          textAlign: "right",
                          ml: "auto",
                      }
                    : { textAlign: "left", mr: "auto" }),
            }}
            id={`message_${id}`}
        >
            {message.body.text}
        </Box>
    );
});

const compareDate = (timestamp1: number, timestamp2: number): boolean => {
    return (
        dayjs.unix(timestamp1 / 1000).format("YYYYMMDD") !==
        dayjs.unix(timestamp2 / 1000).format("YYYYMMDD")
    );
};

function RoomMessages() {
    const roomId = parseInt(useParams().id || "");

    const dispatch = useDispatch();
    const messages = useSelector(selectRoomMessages(roomId));
    const sendingMessages = useSelector(selectRoomSendingMessages(roomId));
    const canLoadMore = useSelector(canLoadMoreMessages(roomId));

    const messagesSorted = useMemo(() => {
        console.log("Calc mesages sorted");
        const sorted = Object.values(messages).sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));

        return sorted.reduce((acc, curr) => {
            const day = dayjs.unix(curr.createdAt / 1000).format("dddd, MMM D");
            if (!acc[day]) {
                acc[day] = [curr];
            } else {
                acc[day].push(curr);
            }

            return acc;
        }, {}) as { [day: string]: MessageType[] };
    }, [messages]);

    useEffect(() => {
        dispatch(fetchMessages({ roomId }));
    }, [dispatch, roomId]);

    const handleLoadMore = () => {
        if (canLoadMore) {
            dispatch(fetchMessages({ roomId }));
            return true;
        }

        return false;
    };

    console.log({ messages, sendingMessages });
    return (
        <Box
            flexGrow={1}
            display="flex"
            flexDirection="column"
            justifyContent="end"
            position="relative"
            sx={{ overflowY: "hidden" }}
        >
            <MessagesContainer onLoadMore={handleLoadMore}>
                {Object.entries(messagesSorted).map(([day, messages], i) => {
                    return (
                        <Box key={day}>
                            <div
                                key={i}
                                style={{
                                    paddingTop: "10px",
                                    margin: "20px 0px 20px 0px",
                                    textAlign: "center",
                                    //borderTop: "1px solid #aaa",
                                }}
                            >
                                {day}
                            </div>

                            {messages.map((m) => {
                                return <Message key={m.id} id={m.id} />;
                            })}
                        </Box>
                    );
                })}

                {Object.values(sendingMessages).map((m) => (
                    <Box
                        id={`sending_message_${m.localId}`}
                        bgcolor={m.status === "sending" ? "green" : "red"}
                        key={m.localId}
                    >
                        {m.body.text}
                    </Box>
                ))}
            </MessagesContainer>
        </Box>
    );
}

function MessagesContainer({
    children,
    onLoadMore,
}: {
    children: React.ReactNode;
    onLoadMore: () => boolean;
}) {
    const roomId = parseInt(useParams().id || "");

    const ref = useRef<HTMLDivElement>();

    useEffect(() => {
        ref.current.dataset.scrollHeight = "";
        ref.current.dataset.locked = "0";
        const observed = new Map();

        let lastMessageCount = Array.from(ref.current.children).filter(
            (e) => !e.id.includes("sending")
        ).length;

        const resizeObserver = new ResizeObserver(() => {
            const lockedForScroll = +ref.current.dataset.locked;

            if (!lockedForScroll) onScrollDown();
        });

        const config = { childList: true, subtree: true };

        const onChildListChange = () => {
            const newChildrenCount = ref.current.children.length;

            if (newChildrenCount) {
                for (let i = 0; i < newChildrenCount; i++) {
                    const element = ref.current.children[i];
                    if (!observed.get(element.id)) {
                        resizeObserver.observe(element);
                        observed.set(element.id, element);
                    }
                }

                const lockedForScroll = +ref.current.dataset.locked;
                const newMessageCount = Array.from(ref.current.children).filter(
                    (e) => !e.id.includes("sending")
                ).length;
                console.log({ lastMessageCount, newMessageCount, lockedForScroll });

                if (lastMessageCount === newMessageCount) {
                    return;
                }

                if (lockedForScroll && lastMessageCount + 1 !== newMessageCount) {
                    console.log("run");
                    const lastScrollHeight = +ref.current.dataset.scrollHeight;
                    if (ref.current.scrollHeight > lastScrollHeight) {
                        ref.current.scrollTop = ref.current.scrollHeight - lastScrollHeight;
                    }
                }

                lastMessageCount = newMessageCount;
            }
        };

        const mutationObserver = new MutationObserver((mutationList) => {
            if (mutationList.some((m) => m.type === "childList")) {
                onChildListChange();
            }
        });

        mutationObserver.observe(ref.current, config);

        console.log("msg contain oberve");

        return () => {
            console.log("msg contain leave");
            mutationObserver.disconnect();
            resizeObserver.disconnect();
        };
    }, [roomId]);

    const onScrollDown = () => {
        if (!ref.current) {
            return;
        }

        scrollElemBottom(ref.current);
        ref.current.dataset.locked = "0";
    };

    const onScroll = (e: React.UIEvent<HTMLElement, UIEvent>) => {
        if (!ref.current) {
            return;
        }

        const target = e.target as HTMLDivElement;

        if (target.scrollTop === 0) {
            const loaded = onLoadMore();
            if (loaded) {
                ref.current.dataset.locked = "1";
            }
        }

        ref.current.dataset.scrollHeight = target.scrollHeight.toString();
    };

    const onWheel = () => {
        if (!ref.current) {
            return;
        }

        const newLockedForScroll = getScrollBottom(ref.current) > 800;
        console.log({ locked: (+newLockedForScroll).toString() });
        ref.current.dataset.locked = (+newLockedForScroll).toString();
    };

    return (
        <Box
            ref={ref}
            sx={{
                overflowY: "auto",
                overflowX: "hidden",
                height: "100%",
                paddingTop: "50px",
                paddingBottom: "50px",
            }}
            id="room-container"
            px={1}
            onScroll={onScroll}
            onWheel={onWheel}
        >
            {children}
        </Box>
    );
}

function scrollElemBottom(element: HTMLElement): void {
    if (element.scrollHeight > element.clientHeight) {
        element.scrollTop = element.scrollHeight - element.clientHeight;
    }
}

function getScrollBottom(element: HTMLElement): number {
    return element.scrollHeight - element.scrollTop - element.clientHeight;
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
