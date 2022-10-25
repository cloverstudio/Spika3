import React, { ReactElement, useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box } from "@mui/material";
import { useParams } from "react-router-dom";

import {
    selectRoomMessages,
    fetchMessagesByRoomId,
    selectRoomMessagesCount,
    selectLoading,
    setEditMessage,
    setReplyMessage,
} from "../slice/chatSlice";

import MessageRow from "./MessageRow";
import DeleteMessageDialog from "./DeleteMessageDialog";
import { MessageDetailDialog } from "./MessageMenu";
import { useGetUserQuery } from "../../auth/api/auth";
import AttachmentManager from "../lib/AttachmentManager";
import NewMessageAlert from "./NewMessageAlert";
type RoomMessagesProps = {
    roomId: number;
};
import { selectUser } from "../../../store/userSlice";
import { useGetRoomQuery } from "../api/room";
import MessageType from "../../../types/Message";
import dayjs from "dayjs";
import * as constants from "../../../../../../lib/constants";

const compareDate = (timestamp1: number, timestamp2: number): boolean => {
    return (
        dayjs.unix(timestamp1 / 1000).format("YYYYMMDD") !==
        dayjs.unix(timestamp2 / 1000).format("YYYYMMDD")
    );
};

export default function RoomMessages({ roomId }: RoomMessagesProps): React.ReactElement {
    const urlParams = useParams();
    const user = useSelector(selectUser);
    const { data } = useGetRoomQuery(roomId);

    const scrollableConversation = useRef<HTMLDivElement>();
    const messagesLengthRef = useRef<number>(0);
    const { data: userData } = useGetUserQuery();
    const dispatch = useDispatch();
    const messages = useSelector(selectRoomMessages(roomId));
    const count = useSelector(selectRoomMessagesCount(roomId));
    const loading = useSelector(selectLoading);
    const [page, setPage] = useState(1);
    const [newMessages, setNewMessages] = useState(0);
    const [lastScrollHeight, setLastScrollHeight] = useState<number>();
    const [lockedForScroll, setLockedForScroll] = useState(false);
    const [dragCounter, setDragCounter] = useState(0);

    const isFetching = loading !== "idle";
    const hasMoreContactsToLoad = count > messages.length;

    const [openMessageDetails, setOpenMessageDetails] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedMessageId, setMessageId] = useState<number>();
    const messageId = parseInt(urlParams.messageId || "") || null;

    useEffect(() => {
        // ignore if paging is less than total message length
        // it is needed to handle the case when message id is specified
        if (page * constants.MESSAGE_PAGING_LIMIT <= messages.length) return;
        dispatch(fetchMessagesByRoomId({ roomId, page, messageId: page === 1 ? messageId : null }));
    }, [page, dispatch, roomId, messageId]);

    const messagesSorted: MessageType[] = [...messages].sort((a, b) => {
        if (a && b) return a.createdAt > b.createdAt ? 1 : -1;
        else return 1;
    });

    const lastMessageFromUserId = messagesSorted[messagesSorted.length - 1]?.fromUserId;
    const isUsersLastMessage = lastMessageFromUserId === userData?.user?.id;

    useEffect(() => {
        if (count > 0 && messageId && !messages.some((m) => m.id === messageId)) {
            setPage(Math.ceil(count / constants.MESSAGE_PAGING_LIMIT));
        }
    }, [messages, messageId, count]);

    useEffect(() => {
        if (!scrollableConversation.current) {
            return;
        }

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
            if (messageId) {
                setTimeout(() => {
                    document.getElementById(`message_${messageId}`)?.scrollIntoView();
                }, 500);
            } else if (scrollableConversation.current.scrollHeight !== lastScrollHeight) {
                onScrollDown();
            }
        }

        messagesLengthRef.current = messages.length;
    }, [messagesSorted.length, isUsersLastMessage, messageId]);

    const handleClick = (event: React.MouseEvent<HTMLDivElement>, messageId: number) => {
        setMessageId(messageId);
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
        if (!scrollableConversation.current) {
            return;
        }

        const newLockedForScroll = getScrollBottom(scrollableConversation.current) > 800;
        setLockedForScroll(newLockedForScroll);

        if (getScrollBottom(scrollableConversation.current) < 500) {
            setNewMessages(0);
        }
    };

    const onScroll = (e: React.UIEvent<HTMLElement, UIEvent>) => {
        if (!scrollableConversation.current) {
            return;
        }

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
        if (!scrollableConversation.current) {
            return;
        }

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

    const selectedMessage = selectedMessageId
        ? messagesSorted.find((m) => m.id === selectedMessageId)
        : null;
    const selectedUsersMessage = selectedMessage?.fromUserId === userData.user.id;

    const handleOnEdit = (id: number) => {
        const selectedMessage = messagesSorted.find((m) => m.id === id);

        if (selectedMessage) {
            dispatch(setEditMessage(selectedMessage));
        }
    };

    const handleOnReply = (id: number) => {
        const selectedMessage = messagesSorted.find((m) => m.id === id);

        if (selectedMessage) {
            dispatch(setReplyMessage(selectedMessage));
        }
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
                px={1}
                sx={{
                    overflowY: "auto",
                    overflowX: "hidden",
                    height: "100%",
                    paddingTop: "50px",
                    paddingBottom: "50px",
                }}
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
                    bgcolor="action.hover"
                    zIndex={9999}
                >
                    <i className="fa fa-cloud-upload"></i>
                    <p> Drop files now </p>
                </Box>
                {messagesSorted.map((m, i) => {
                    const previousMessage = i > 0 ? messagesSorted[i - 1] : null;

                    const additionalRows: ReactElement[] = [];

                    if (previousMessage && compareDate(previousMessage.createdAt, m.createdAt)) {
                        additionalRows.push(
                            <div
                                key={i}
                                style={{
                                    paddingTop: "10px",
                                    margin: "20px 0px 20px 0px",
                                    textAlign: "center",
                                    //borderTop: "1px solid #aaa",
                                }}
                            >
                                {dayjs.unix(m.createdAt / 1000).format("dddd, MMM D")}
                            </div>
                        );
                    }

                    return (
                        <div key={m.id} id={`message_${m.id}`}>
                            {additionalRows.map((r) => r)}
                            <MessageRow
                                key={m.id}
                                {...m}
                                nextMessageSenderId={messagesSorted[i + 1]?.fromUserId}
                                previousMessageSenderId={messagesSorted[i - 1]?.fromUserId}
                                clickedAnchor={handleClick}
                                showMessageDetails={(id) => {
                                    setMessageId(id);
                                    showModalMessageDetails();
                                }}
                                onDelete={(id) => {
                                    setMessageId(id);
                                    setShowDeleteModal(true);
                                }}
                                onEdit={(id) => {
                                    setMessageId(id);
                                    handleOnEdit(id);
                                }}
                                onReply={(id) => {
                                    setMessageId(id);
                                    handleOnReply(id);
                                }}
                                user={user}
                                data={data}
                                isDeleted={m.deleted}
                                messageRecordsData={m.messageRecords}
                                highlight={messageId === m.id}
                                isReply={m.reply}
                            />
                        </div>
                    );
                })}
            </Box>
            {openMessageDetails && (
                <MessageDetailDialog
                    open={openMessageDetails}
                    onClose={handleCloseMessageDetails}
                    messageId={selectedMessageId}
                    message={selectedMessage}
                />
            )}
            {showDeleteModal && (
                <DeleteMessageDialog
                    open={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    messageId={selectedMessageId}
                    isUserMessage={selectedUsersMessage}
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
