import React, { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../../../hooks";
import {
    getSearchedMessages,
    resetSearchedMessages,
    setKeyword,
    setTargetMessage,
} from "../../../slices/messages";
import { useParams } from "react-router-dom";
import SearchBox from "../../SearchBox";
import { MessageItem } from "./RightSidebarMediaContent";
import useStrings from "../../../../../hooks/useStrings";
import { rightSidebarSearchMessagesBatchLimit } from "../../../lib/consts";

export default function RightSidebarSearchContent() {
    const roomId = parseInt(useParams().id || "");

    const dispatch = useAppDispatch();
    const messages = useAppSelector((state) => state.messages[roomId]?.searchedMessages);
    const [isScrolledToBottom, setIsScrolledToBottom] = React.useState(false);
    const count = useAppSelector((state) => state.messages[roomId]?.searchedMessagesCount);
    const isLoading = useAppSelector((state) => state.messages[roomId]?.loading);
    const keyword = useAppSelector((state) => state.messages[roomId]?.keyword);
    const strings = useStrings();

    const itemsPerBatch = rightSidebarSearchMessagesBatchLimit;

    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.addEventListener("scroll", () => {
                const { scrollTop, scrollHeight, clientHeight } = ref.current!;

                setIsScrolledToBottom(scrollHeight - scrollTop < clientHeight + 100);
            });
        }

        return () => {
            if (ref.current) {
                ref.current.removeEventListener("scroll", () => {});
            }
            dispatch(resetSearchedMessages(roomId));
            dispatch(setKeyword({ roomId, keyword: "" }));
            dispatch(setTargetMessage({ roomId, messageId: null }));
        };
    }, []);

    useEffect(() => {
        if (isScrolledToBottom && messages?.length < count && !isLoading && keyword) {
            dispatch(
                getSearchedMessages({
                    roomId,
                    keyword,
                    itemsPerBatch,
                    cursor: messages?.[messages.length - 1]?.id,
                }),
            );
        }
        setIsScrolledToBottom(false);
    }, [isScrolledToBottom]);

    const handleSearch = (keyword: string) => {
        dispatch(setKeyword({ roomId, keyword }));
        dispatch(resetSearchedMessages(roomId));

        if (keyword.length < 3) return;

        dispatch(
            getSearchedMessages({
                roomId,
                keyword: keyword,
                itemsPerBatch,
            }),
        );
    };

    const messageClickHandler = (messageId: number) => {
        dispatch(setTargetMessage({ roomId, messageId }));
    };

    return (
        <Box
            height="100%"
            sx={{
                overflowY: "hidden",
            }}
        >
            <Box width="100%" mt="15px">
                <SearchBox
                    onSearch={handleSearch}
                    customStyles={{
                        px: 1,
                    }}
                />
            </Box>

            <Box
                sx={{
                    height: "calc(100vh - 180px)",
                    overflowY: "auto",
                    width: "100%",
                    px: 1,
                }}
                ref={ref}
            >
                {messages?.map((message) => (
                    <MessageItem
                        key={message.messageId}
                        message={message}
                        onClick={messageClickHandler}
                        highlightSearchedText={true}
                    />
                ))}
                {(!keyword || keyword?.length < 3) && !isLoading && (
                    <Box textAlign="center" mt={2}>
                        {strings.searchForMessages}
                    </Box>
                )}
                {keyword && keyword.length >= 3 && !isLoading && messages?.length === 0 && (
                    <Box textAlign="center" mt={2}>
                        {strings.noMessagesFound}
                    </Box>
                )}
            </Box>
        </Box>
    );
}
