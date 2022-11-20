import { Box } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import AttachmentManager from "../../lib/AttachmentManager";
import {
    canLoadMoreMessages,
    fetchMessages,
    selectCursor,
    selectIsLastMessageFromUser,
    selectRoomMessagesLength,
} from "../../slices/messages";
import NewMessageAlert from "./NewMessageAlert";

export default function MessagesContainer({
    children,
}: {
    children: React.ReactNode;
}): React.ReactElement {
    const roomId = parseInt(useParams().id || "");
    const targetMessageId = parseInt(useParams().messageId || "");

    const messagesLength = useSelector(selectRoomMessagesLength(roomId));
    const isLastMessageFromUser = useSelector(selectIsLastMessageFromUser(roomId));
    const canLoadMore = useSelector(canLoadMoreMessages(roomId));
    const cursor = useSelector(selectCursor(roomId));
    const dispatch = useDispatch();

    const messagesLengthRef = useRef(0);
    const ref = useRef<HTMLDivElement>();
    const [newMessages, setNewMessages] = useState(0);
    const [dragCounter, setDragCounter] = useState(0);

    useEffect(() => {
        ref.current.dataset.locked = "0";
        ref.current.dataset.scrollHeight = ref.current.scrollHeight.toString();
        messagesLengthRef.current = 0;

        onScrollDown();
    }, [roomId]);

    useEffect(() => {
        const locked = +ref.current.dataset.locked;
        const lastScrollHeight = +ref.current.dataset.scrollHeight;

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
        } else {
            if (targetMessageId) {
                setTimeout(() => {
                    document.getElementById(`message_${targetMessageId}`)?.scrollIntoView();
                }, 500);
            } else if (ref.current.scrollHeight !== lastScrollHeight) {
                onScrollDown();
            }
        }

        messagesLengthRef.current = messagesLength;
    }, [messagesLength, targetMessageId]);

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

        if (target.scrollTop === 0 && messagesLength) {
            if (canLoadMore) {
                ref.current.dataset.locked = "1";
                dispatch(fetchMessages({ roomId, cursor }));
            }
        }

        if (getScrollBottom(ref.current) < 500) {
            setNewMessages(0);
        }

        ref.current.dataset.scrollHeight = target.scrollHeight.toString();
    };

    const onWheel = () => {
        if (!ref.current) {
            return;
        }

        if (getScrollBottom(ref.current) < 500) {
            setNewMessages(0);
        }

        const newLockedForScroll = getScrollBottom(ref.current) > 800;
        ref.current.dataset.locked = (+newLockedForScroll).toString();
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

function scrollElemBottom(element: HTMLElement): void {
    if (element.scrollHeight > element.clientHeight) {
        element.scrollTop = element.scrollHeight - element.clientHeight;
    }
}

function getScrollBottom(element: HTMLElement): number {
    return element.scrollHeight - element.scrollTop - element.clientHeight;
}
