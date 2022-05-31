import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box } from "@mui/material";

import { selectRoomMessages, fetchMessagesByRoomId, selectLoading } from "../slice/chatSlice";

import Message from "../components/Message";
import { MessageMenu, MessageDetailDialog } from "../components/MessageMenu";
import { ExpandMore } from "@mui/icons-material";
import { useGetUserQuery } from "../../auth/api/auth";
import AttachmentManager from "../lib/AttachmentManager";
type RoomMessagesProps = {
    roomId: number;
};

export default function RoomMessages({ roomId }: RoomMessagesProps): React.ReactElement {
    const scrollableConversation = useRef<HTMLDivElement>();
    const messagesLengthRef = useRef<number>(0);
    const { data: userData } = useGetUserQuery();
    const dispatch = useDispatch();
    const { messages, count } = useSelector(selectRoomMessages(roomId));
    const loading = useSelector(selectLoading());
    const [page, setPage] = useState(1);
    const [newMessages, setNewMessages] = useState(0);
    const [lastScrollHeight, setLastScrollHeight] = useState<number>(null);
    const [lockedForScroll, setLockedForScroll] = useState(false);
    const [dragCounter, setDragCounter] = useState(0);

    const isFetching = loading !== "idle";
    const hasMoreContactsToLoad = count > messages.length;

    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const [openMessageDetails, setOpenMessageDetails] = useState(false);
    const [selectedMessageId, setMessageId] = useState(null);
    const open = Boolean(anchorEl);

    useEffect(() => {
        dispatch(fetchMessagesByRoomId({ roomId, page }));
    }, [page, dispatch, roomId]);

    const messagesSorted = messages.sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
    const lastMessageFromUserId = messagesSorted[messagesSorted.length - 1]?.fromUserId;
    const isUsersLastMessage = lastMessageFromUserId === userData?.user?.id;

    useEffect(() => {
        if (lockedForScroll) {
            if (
                scrollableConversation.current.scrollHeight > lastScrollHeight &&
                messages.length - messagesLengthRef.current > 1
            ) {
                scrollableConversation.current.scrollTop =
                    scrollableConversation.current.scrollHeight - lastScrollHeight;
            }

            if (messages.length - messagesLengthRef.current === 1) {
                if (!isUsersLastMessage) {
                    setNewMessages((m) => m + 1);
                }
            }
        } else {
            if (scrollableConversation.current.scrollHeight !== lastScrollHeight) {
                onScrollDown();
            }
        }

        messagesLengthRef.current = messages.length;
    }, [messagesSorted.length, isUsersLastMessage]);

    const handleClick = (event: React.MouseEvent<HTMLDivElement>, messageId: number) => {
        setMessageId(messageId);
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMessageMenu = () => {
        setAnchorEl(null);
    };

    const showModalMessageDetails = () => {
        setOpenMessageDetails(true);
    };

    const handleCloseMessageDetails = () => {
        setOpenMessageDetails(false);
    };

    useEffect(() => {
        return () => {
            setPage(1);
        };
    }, [roomId]);

    const onWheel = () => {
        const newLockedForScroll = getScrollBottom(scrollableConversation.current) > 800;
        setLockedForScroll(newLockedForScroll);

        if (getScrollBottom(scrollableConversation.current) < 500) {
            setNewMessages(0);
        }
    };

    const onScroll = (e: React.UIEvent<HTMLElement, UIEvent>) => {
        const target = e.target as HTMLDivElement;

        if (target.scrollTop === 0 && !isFetching && messages[0] && hasMoreContactsToLoad) {
            setPage((page) => page + 1);
            setLockedForScroll(true);
        }
        setLastScrollHeight(target.scrollHeight);

        if (getScrollBottom(scrollableConversation.current) < 500) {
            setNewMessages(0);
        }
    };

    const onScrollDown = () => {
        scrollElemBottom(scrollableConversation.current);
        setLockedForScroll(false);
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

        if (transfer.items) {
            for (let i = 0; i < transfer.items.length; i++) {
                if (transfer.items[i].kind === "file") {
                    const file = transfer.items[i].getAsFile();
                    AttachmentManager.addFiles({ roomId, files: [file] });
                }
            }
        } else {
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
                <Box position="absolute" width="100%" textAlign="center">
                    <Box display="inline-block" onClick={onScrollDown}>
                        <Box
                            bgcolor="#C8EBFE"
                            borderRadius="0.625rem"
                            display="flex"
                            m={0.5}
                            p={1}
                            sx={{ cursor: "pointer" }}
                        >
                            <Box>{`${newMessages} new message${newMessages > 1 ? "s" : ""}`}</Box>
                            <ExpandMore />
                        </Box>
                    </Box>
                </Box>
            )}
            <Box
                px={1}
                sx={{ overflowY: "auto" }}
                ref={scrollableConversation}
                onWheel={onWheel}
                onScroll={onScroll}
                onDragEnter={handleDragEnter}
                onDrop={handleDrop}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                id="room-messages"
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
                    bgcolor="#e5f4ffa6"
                    zIndex={9999}
                >
                    <i className="fa fa-cloud-upload"></i>
                    <p> Drop files now </p>
                </Box>
                {messagesSorted.map((m, i) => (
                    <Message
                        key={m.id}
                        {...m}
                        nextMessageSenderId={messagesSorted[i + 1]?.fromUserId}
                        previousMessageSenderId={messagesSorted[i - 1]?.fromUserId}
                        clickedAnchor={handleClick}
                    />
                ))}
            </Box>
            <MessageMenu
                open={open}
                onClose={handleCloseMessageMenu}
                anchorElement={anchorEl}
                showMessageDetails={showModalMessageDetails}
            />
            {openMessageDetails && (
                <MessageDetailDialog
                    open={openMessageDetails}
                    onClose={handleCloseMessageDetails}
                    messageId={selectedMessageId}
                />
            )}
        </Box>
    );
}

function getScrollBottom(element: HTMLElement): number {
    return element.scrollHeight - element.scrollTop - element.clientHeight;
}

function scrollElemBottom(element: HTMLElement): void {
    if (element.scrollHeight > element.clientHeight) {
        element.scrollTop = element.scrollHeight - element.clientHeight;
    }
}
