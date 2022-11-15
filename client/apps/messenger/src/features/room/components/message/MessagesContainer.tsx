import { Box } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
    canLoadMoreMessages,
    fetchMessages,
    selectCursor,
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
    const canLoadMore = useSelector(canLoadMoreMessages(roomId));
    const cursor = useSelector(selectCursor(roomId));
    const dispatch = useDispatch();
    const messagesLengthRef = useRef(0);
    const [newMessages, setNewMessages] = useState(0);

    const ref = useRef<HTMLDivElement>();

    useEffect(() => {
        ref.current.dataset.locked = "0";
        ref.current.dataset.scrollHeight = "";
        messagesLengthRef.current = 0;
    }, []);

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

            if (messagesLength - messagesLengthRef.current === 1) {
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
    }, [roomId, messagesLength, targetMessageId]);

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
            >
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
