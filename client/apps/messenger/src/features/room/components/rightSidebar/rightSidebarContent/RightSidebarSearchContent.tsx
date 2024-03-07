import React, { useEffect, useRef, useState } from "react";
import { Box, IconButton, useMediaQuery, useTheme } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../../../hooks";
import {
    getOldestMessageDate,
    getSearchedMessages,
    getTargetMessageIdByDate,
    resetSearchedMessages,
    setKeyword,
    setTargetMessage,
} from "../../../slices/messages";
import { useParams } from "react-router-dom";
import SearchBox from "../../SearchBox";
import { MessageItem } from "./RightSidebarMediaContent";
import useStrings from "../../../../../hooks/useStrings";
import { rightSidebarSearchMessagesBatchLimit } from "../../../lib/consts";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import { DatePicker } from "../../../../../components/DatePicker";
import useEscapeKey from "../../../../../hooks/useEscapeKey";
import { toggleRightSidebar } from "../../../slices/rightSidebar";

export default function RightSidebarSearchContent() {
    const roomId = parseInt(useParams().id || "");

    const dispatch = useAppDispatch();
    const messages = useAppSelector((state) => state.messages[roomId]?.searchedMessages);
    const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
    const count = useAppSelector((state) => state.messages[roomId]?.searchedMessagesCount);
    const isLoading = useAppSelector((state) => state.messages[roomId]?.loading);
    const keyword = useAppSelector((state) => state.messages[roomId]?.keyword);
    const strings = useStrings();
    const themeObject = useTheme();
    const isMobile = useMediaQuery(themeObject.breakpoints.down("md"));
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const itemsPerBatch = rightSidebarSearchMessagesBatchLimit;

    const ref = useRef<HTMLDivElement>(null);

    const oldestMessageDate = useAppSelector((state) => state.messages[roomId]?.oldestMessageDate);

    useEscapeKey(() => {
        setIsCalendarOpen(false);
    });

    useEffect(() => {
        dispatch(getOldestMessageDate({ roomId }));

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
            if (!isMobile) {
                dispatch(setKeyword({ roomId, keyword: "" }));
                dispatch(setTargetMessage({ roomId, messageId: null }));
            }
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
        dispatch(setTargetMessage({ roomId, messageId: null }));

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
        if (isMobile) {
            dispatch(setKeyword({ roomId, keyword: "" }));
            dispatch(toggleRightSidebar());
        }
        dispatch(setTargetMessage({ roomId, messageId }));
    };

    const dayClickHandler = (day: Date) => {
        dispatch(setKeyword({ roomId, keyword: "" }));

        const inputDate = new Date(day);

        const formattedDate = `${inputDate.getFullYear()}-${(inputDate.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${inputDate.getDate().toString().padStart(2, "0")}`;

        const formattedDateToIso = new Date(formattedDate).toISOString();

        dispatch(getTargetMessageIdByDate({ roomId, date: formattedDateToIso }));
        if (isMobile) {
            dispatch(toggleRightSidebar());
        }
    };

    return (
        <Box
            height="100%"
            sx={{
                overflowY: "hidden",
            }}
        >
            <Box
                mt="15px"
                sx={{
                    position: "relative",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "41px",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                        px: 1,
                        ml: 1,
                        "&:hover": {
                            backgroundColor: "background.paper",
                            borderRadius: "8px",
                            cursor: "pointer",
                        },
                        ...(isCalendarOpen && {
                            backgroundColor: "background.paper",
                            borderRadius: "8px",
                        }),
                    }}
                    onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                >
                    <CalendarTodayOutlinedIcon />
                </Box>
                <Box height="100%" width="100%">
                    <SearchBox
                        onSearch={handleSearch}
                        customStyles={{
                            px: 1,
                        }}
                        onFocus={() => {
                            if (isCalendarOpen) setIsCalendarOpen(false);
                        }}
                    />
                </Box>
                {isCalendarOpen && (
                    <Box
                        sx={{
                            position: "absolute",
                            top: "45px",
                            left: "4px",
                        }}
                    >
                        <DatePicker
                            onClickDay={dayClickHandler}
                            maxDate={new Date()}
                            minDate={new Date(oldestMessageDate)}
                        />
                    </Box>
                )}
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
