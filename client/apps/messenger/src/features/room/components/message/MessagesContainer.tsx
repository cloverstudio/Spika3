import { Box, CircularProgress, IconButton, useMediaQuery } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useGetRoomQuery } from "../../api/room";
import AttachmentManager from "../../lib/AttachmentManager";
import {
    canLoadMoreMessages,
    fetchMessages,
    fetchTargetMessageBatch,
    resetTargetMessageBatchProperties,
    selectCursor,
    selectIsLastMessageFromUser,
    selectKeyword,
    selectRoomMessagesIsLoading,
    selectRoomMessagesLength,
    selectTargetMessage,
    setIsInitialTargetMessageBatch,
    setTargetMessage,
} from "../../slices/messages";
import NewMessageAlert from "./NewMessageAlert";
import { useTheme } from "@mui/material/styles";
import { useRoomType } from "./Message";
import { useAppDispatch, useAppSelector } from "../../../../hooks";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import { createContext, useContext } from "react";
export type GlobalContent = {
    messageContainerRef: React.MutableRefObject<HTMLDivElement | null>;
};

export const MessagesContainerContext = createContext<GlobalContent>({
    messageContainerRef: null,
});
export const useMessageContainerContext = () => useContext(MessagesContainerContext);

export default function MessagesContainer({
    children,
    bgColor,
}: {
    children: React.ReactNode;
    bgColor: string;
}): React.ReactElement {
    const roomId = parseInt(useParams().id || "");
    const targetMessageId = useSelector(selectTargetMessage(roomId));

    const messagesLength = useSelector(selectRoomMessagesLength(roomId));
    const isLastMessageFromUser = useSelector(selectIsLastMessageFromUser(roomId));
    const canLoadMore = useSelector(canLoadMoreMessages(roomId));
    const cursor = useSelector(selectCursor(roomId));
    const dispatch = useAppDispatch();

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
    const searchKeyword = useSelector(selectKeyword(roomId));

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const roomType = useRoomType();
    const isGroup = roomType === "group";

    const isInitialTargetMessageBatchFetching = useAppSelector(
        (state) => state.messages[roomId]?.isInitialTargetMessageBatch,
    );
    const targetMessageBatchCursorUp = useAppSelector(
        (state) => state.messages[roomId]?.targetMessageBatchCursorUp,
    );
    const targetMessageBatchCursorDown = useAppSelector(
        (state) => state.messages[roomId]?.targetMessageBatchCursorDown,
    );
    const hasMoreNewerTargetMessageBatch = useAppSelector(
        (state) => state.messages[roomId]?.hasMoreNewerTargetMessageBatch,
    );
    const hasMoreOlderTargetMessageBatch = useAppSelector(
        (state) => state.messages[roomId]?.hasMoreOlderTargetMessageBatch,
    );
    const fetchingTargetMessageBatchEnabled = useAppSelector(
        (state) => state.messages[roomId]?.fetchingTargetMessageBatchEnabled,
    );

    const [isScrollingToBottomDisabled, setScrollingToBottomDisabled] = useState(false);
    const [isScrolledToBottom, setScrolledToBottom] = useState(false);

    const resetIsInitialTargetMessageBatch = () => {
        setTimeout(() => {
            dispatch(
                setIsInitialTargetMessageBatch({
                    roomId,
                    isInitialTargetMessageBatch: false,
                }),
            );
        }, 1000);
    };

    useEffect(() => {
        if (targetMessageId) {
            setScrolledToTargetMessage(false);
        }
    }, [targetMessageId]);

    useEffect(() => {
        if (locked || searchKeyword) {
            if (
                ref.current.scrollHeight > lastScrollHeight &&
                messagesLength - messagesLengthRef.current > 1 &&
                !isScrolledToBottom
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
                        ele.scrollIntoView({
                            behavior: fetchingTargetMessageBatchEnabled ? "instant" : "smooth",
                            block: "nearest",
                            inline: "nearest",
                        });
                        setScrolledToTargetMessage(true);
                        setLoading(false);
                    }

                    if (isInitialTargetMessageBatchFetching) {
                        resetIsInitialTargetMessageBatch();
                    }
                }, 10);
            }
        } else if (targetMessageId) {
            setTimeout(() => {
                const ele = document.getElementById(`message_${targetMessageId}`);

                if (ele && !scrolledToTargetMessage) {
                    ele.scrollIntoView({
                        behavior: fetchingTargetMessageBatchEnabled ? "instant" : "smooth",
                        block: "nearest",
                        inline: "nearest",
                    });
                    setScrolledToTargetMessage(true);
                    setLoading(false);
                }

                if (isInitialTargetMessageBatchFetching) {
                    resetIsInitialTargetMessageBatch();
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
        searchKeyword,
    ]);

    useEffect(() => {
        if (initialLoading || loading || roomIsLoading) {
            return;
        }
        const resize = new ResizeObserver(function () {
            if (!locked) {
                onScrollDown(newMessages ? "smooth" : undefined);
            }
        });

        if (ref.current) {
            resize.observe(ref.current);
        }

        return () => {
            resize.disconnect();
        };
    }, [initialLoading, loading, locked, roomIsLoading]);

    const onScrollDown = (behavior?: ScrollBehavior) => {
        if (!ref.current) {
            return;
        }
        scrollElemBottom(
            ref.current,
            () => setLoading(false),
            behavior || "instant",
            isScrollingToBottomDisabled,
        );
        setLockedForScroll(false);
        setScrollingToBottomDisabled(false);
        setScrolledToBottom(false);
    };

    const onScroll = (e: React.UIEvent<HTMLElement, UIEvent>) => {
        if (!ref.current) {
            return;
        }

        const target = e.target as HTMLDivElement;

        const isScrolledToTheBottom =
            Math.abs(target.scrollTop - (ref.current.scrollHeight - ref.current.clientHeight)) < 5;

        if (
            isScrolledToTheBottom &&
            fetchingTargetMessageBatchEnabled &&
            hasMoreNewerTargetMessageBatch &&
            !isInitialTargetMessageBatchFetching
        ) {
            setLockedForScroll(true);
            setScrollingToBottomDisabled(true);
            setScrolledToBottom(true);

            dispatch(
                fetchTargetMessageBatch({
                    roomId,
                    targetMessageId,
                    cursorDown: targetMessageBatchCursorDown,
                }),
            );
        }

        if (target.scrollTop === 0 && messagesLength) {
            if (fetchingTargetMessageBatchEnabled && hasMoreOlderTargetMessageBatch) {
                setLockedForScroll(true);

                dispatch(
                    fetchTargetMessageBatch({
                        roomId,
                        targetMessageId,
                        cursorUp: targetMessageBatchCursorUp,
                    }),
                );
            } else if (canLoadMore && !fetchingTargetMessageBatchEnabled) {
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

    const loadNewestMessagesHandler = () => {
        if (fetchingTargetMessageBatchEnabled && hasMoreNewerTargetMessageBatch) {
            dispatch(setTargetMessage({ roomId, messageId: null }));
            dispatch(resetTargetMessageBatchProperties(roomId));
            setScrolledToBottom(false);
            setScrollingToBottomDisabled(false);
            dispatch(fetchMessages({ roomId }));
        }
        scrollElemBottom(ref.current, () => setLoading(false), "instant");
    };

    return (
        <MessagesContainerContext.Provider value={{ messageContainerRef: ref }}>
            <Box
                flexGrow={1}
                display="flex"
                flexDirection="column"
                justifyContent="end"
                position="relative"
                sx={{
                    overflowY: "hidden",
                    backgroundColor: bgColor,
                }}
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
                        zIndex={10}
                        bgcolor={
                            loading && messagesLength > 0 ? "common.disabledBackground" : bgColor
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
                        paddingRight: isMobile ? "8px" : "48px",
                        paddingLeft: isMobile ? "8px" : isGroup ? "32px" : "56px",
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
                {fetchingTargetMessageBatchEnabled &&
                    !loading &&
                    hasMoreNewerTargetMessageBatch && (
                        <Box
                            sx={{
                                position: "absolute",
                                bottom: "18px",
                                right: "5px",
                            }}
                        >
                            <IconButton
                                onClick={loadNewestMessagesHandler}
                                sx={{
                                    bgcolor: "background.paper",
                                    color: "text.primary",
                                    "&:hover": {
                                        bgcolor: "common.hoverBackground",
                                    },
                                    padding: "4px",
                                }}
                            >
                                <KeyboardArrowDownIcon sx={{ width: "30px", height: "30px" }} />
                            </IconButton>
                        </Box>
                    )}
            </Box>
        </MessagesContainerContext.Provider>
    );
}

function scrollElemBottom(
    element: HTMLElement,
    onScroll?: () => void,
    behavior?: ScrollBehavior,
    isScrollingToBottom?: boolean,
): void {
    if (element.scrollHeight > element.clientHeight) {
        if (!isScrollingToBottom)
            element.scrollTo({ top: element.scrollHeight - element.clientHeight, behavior });
    }

    if (onScroll) {
        onScroll();
    }
}

function getScrollBottom(element: HTMLElement): number {
    return element.scrollHeight - element.scrollTop - element.clientHeight;
}
