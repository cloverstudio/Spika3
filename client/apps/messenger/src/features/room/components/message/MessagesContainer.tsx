import { Box, CircularProgress } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useGetRoomQuery } from "../../api/room";
import AttachmentManager from "../../lib/AttachmentManager";
import {
    canLoadMoreMessages,
    fetchMessages,
    selectCursor,
    selectIsLastMessageFromUser,
    selectRoomMessagesIsLoading,
    selectRoomMessagesLength,
    selectTargetMessage,
} from "../../slices/messages";
import NewMessageAlert from "./NewMessageAlert";

export default function MessagesContainer({
    children,
}: {
    children: React.ReactNode;
}): React.ReactElement {
    const roomId = parseInt(useParams().id || "");
    const targetMessageId = useSelector(selectTargetMessage(roomId));

    const messagesLength = useSelector(selectRoomMessagesLength(roomId));
    const isLastMessageFromUser = useSelector(selectIsLastMessageFromUser(roomId));
    const canLoadMore = useSelector(canLoadMoreMessages(roomId));
    const cursor = useSelector(selectCursor(roomId));
    const dispatch = useDispatch();

    const messagesLengthRef = useRef(0);
    const ref = useRef<HTMLDivElement>();
    const [newMessages, setNewMessages] = useState(0);
    const [dragCounter, setDragCounter] = useState(0);

    const [scrolledToTargetMessage, setScrolledToTargetMessage] = useState(false);
    const [lastScrollHeight, setLastScrollHeight] = useState<number>();
    const [locked, setLockedForScroll] = useState(false);
    const [initialLoading, setLoading] = useState(true);
    const { isLoading: roomIsLoading } = useGetRoomQuery(roomId);
    const loading = useSelector(selectRoomMessagesIsLoading(roomId));

    useEffect(() => {
        if (targetMessageId) {
            setScrolledToTargetMessage(false);
        }
    }, [targetMessageId]);

    useEffect(() => {
        if (locked) {
            if (
                ref.current.scrollHeight > lastScrollHeight &&
                messagesLength - messagesLengthRef.current > 1
            ) {
                ref.current.scrollTop = ref.current.scrollHeight - lastScrollHeight;
            }

            if (messagesLength - messagesLengthRef.current === 1 && !isLastMessageFromUser) {
                setNewMessages((m) => m + 1);
            }

            if (targetMessageId) {
                setTimeout(() => {
                    const ele = document.getElementById(`message_${targetMessageId}`);

                    if (ele && !scrolledToTargetMessage) {
                        ele.scrollIntoView();
                        setScrolledToTargetMessage(true);
                        setLoading(false);
                    }
                }, 10);
            }
        } else if (targetMessageId) {
            setTimeout(() => {
                const ele = document.getElementById(`message_${targetMessageId}`);

                if (ele && !scrolledToTargetMessage) {
                    ele.scrollIntoView();
                    setScrolledToTargetMessage(true);
                    setLoading(false);
                }
            }, 10);
        } else if (ref.current.scrollHeight !== lastScrollHeight && messagesLength) {
            const isOneMessageDiff = messagesLength - messagesLengthRef.current === 1;
            const behavior = isOneMessageDiff ? "smooth" : "instant";

            setTimeout(() => onScrollDown(behavior), isOneMessageDiff ? 10 : 350);
        } else if (loading !== undefined && !loading && !roomIsLoading && initialLoading) {
            setLoading(false);
        }

        messagesLengthRef.current = messagesLength;
    }, [
        isLastMessageFromUser,
        lastScrollHeight,
        locked,
        messagesLength,
        targetMessageId,
        scrolledToTargetMessage,
        roomIsLoading,
        loading,
        initialLoading,
    ]);

    const onScrollDown = (behavior?: ScrollBehavior) => {
        if (!ref.current) {
            return;
        }
        scrollElemBottom(ref.current, () => setLoading(false), behavior || "instant");
        setLockedForScroll(false);
    };

    const onScroll = (e: React.UIEvent<HTMLElement, UIEvent>) => {
        if (!ref.current) {
            return;
        }

        const target = e.target as HTMLDivElement;

        if (target.scrollTop === 0 && messagesLength) {
            if (canLoadMore) {
                setLockedForScroll(true);
                dispatch(fetchMessages({ roomId, cursor }));
            }
        }

        if (getScrollBottom(ref.current) < 500) {
            setNewMessages(0);
        }

        setLastScrollHeight(target.scrollHeight);
    };

    const onWheel = () => {
        if (!ref.current) {
            return;
        }

        if (getScrollBottom(ref.current) < 500) {
            setNewMessages(0);
        }

        setLockedForScroll(getScrollBottom(ref.current) > 300);
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();

        setDragCounter((c) => c + 1);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();

        setDragCounter((c) => c - 1);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();

        const transfer = e.nativeEvent.dataTransfer;

        if (!transfer) {
            return;
        }
        if (transfer.items) {
            for (let i = 0; i < transfer.items.length; i++) {
                if (transfer.items[i].kind === "file") {
                    const file = transfer.items[i].getAsFile();
                    if (file) {
                        AttachmentManager.addFiles({ roomId, files: [file] });
                    }
                }
            }
        } else if (transfer.files) {
            AttachmentManager.addFiles({
                roomId,
                files: Array.from(transfer.files),
            });
        }

        setDragCounter(0);
    };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    return (
        <Box
            flexGrow={1}
            display="flex"
            flexDirection="column"
            justifyContent="end"
            position="relative"
            sx={{ overflowY: "hidden" }}
        >
            {(initialLoading || loading || roomIsLoading) && (
                <Box
                    position="absolute"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    flexDirection="column"
                    top="0"
                    left="0"
                    right="0"
                    bottom="0"
                    zIndex={1}
                    bgcolor={
                        loading && messagesLength > 0
                            ? "common.disabledBackground"
                            : "background.default"
                    }
                >
                    <CircularProgress />
                </Box>
            )}
            {newMessages > 0 && (
                <NewMessageAlert newMessages={newMessages} onScrollDown={onScrollDown} />
            )}
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
                onDragEnter={handleDragEnter}
                onDrop={handleDrop}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
            >
                <Box
                    position="absolute"
                    left="0"
                    right="0"
                    top="0"
                    bottom="0"
                    display={dragCounter > 0 ? "flex" : "none"}
                    justifyContent="center"
                    alignItems="center"
                    bgcolor="action.hover"
                    zIndex={9999}
                >
                    <i className="fa fa-cloud-upload"></i>
                    <p> Drop files here!</p>
                </Box>
                {children}
            </Box>
        </Box>
    );
}

function scrollElemBottom(
    element: HTMLElement,
    onScroll?: () => void,
    behavior?: ScrollBehavior
): void {
    if (element.scrollHeight > element.clientHeight) {
        element.scrollTo({ top: element.scrollHeight - element.clientHeight, behavior });
    }

    if (onScroll) {
        onScroll();
    }
}

function getScrollBottom(element: HTMLElement): number {
    return element.scrollHeight - element.scrollTop - element.clientHeight;
}
