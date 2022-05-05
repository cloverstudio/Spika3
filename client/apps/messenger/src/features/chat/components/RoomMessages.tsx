import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Box } from "@mui/material";

import { useGetMessagesByRoomIdQuery } from "../api/message";

import { selectRoomMessages } from "../slice/chatSlice";

import useIsInViewport from "../../../hooks/useIsInViewport";
import Message from "../components/Message";
import { MessageMenu, MessageDetailDialog } from "../components/MessageMenu";

type RoomMessagesProps = {
    roomId: number;
};

export default function RoomMessages({ roomId }: RoomMessagesProps): React.ReactElement {
    const ref = useRef<HTMLBaseElement>();
    const { messages, count } = useSelector(selectRoomMessages(roomId));
    const [page, setPage] = useState(1);
    const [scrollTop, setScrollTop] = useState(null);
    const [scrollListenerSet, setScrollListener] = useState(false);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const { isFetching } = useGetMessagesByRoomIdQuery({ roomId, page });
    const hasMoreContactsToLoad = count > messages.length;

    const { isInViewPort, elementRef } = useIsInViewport();

    const [anchorEl, setAnchorEl] = React.useState<HTMLDivElement | null>(null);
    const [openMessageDetails, setOpenMessageDetails] = React.useState(false);
    const [selectedMessageId, setMessageId] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLDivElement>, messageId: number) => {
        setMessageId(messageId);
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const showModalMessageDetails = () => {
        setOpenMessageDetails(true);
    };
    const handleCloseMessageDetails = () => {
        setOpenMessageDetails(false);
    };

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
                        clickedAnchor={handleClick}
                    />
                ))}
            </Box>
            <MessageMenu
                open={open}
                onClose={handleClose}
                anchorElement={anchorEl}
                showMessageDetails={showModalMessageDetails}
            />
            {openMessageDetails ? (
                <MessageDetailDialog
                    open={openMessageDetails}
                    onClose={handleCloseMessageDetails}
                    messageId={selectedMessageId}
                />
            ) : null}
        </Box>
    );
}
