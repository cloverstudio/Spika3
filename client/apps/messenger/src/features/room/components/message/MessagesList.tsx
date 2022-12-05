import { DoDisturb } from "@mui/icons-material";
import { Box, Button } from "@mui/material";
import dayjs from "dayjs";
import React, { memo, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import MessageType from "../../../../types/Message";
import { useGetRoomBlockedQuery } from "../../api/room";
import {
    fetchMessages,
    selectCursor,
    selectRoomMessages,
    selectShouldDisplayBlockButton,
} from "../../slices/messages";
import Message from "./Message";
import MessagesContainer from "./MessagesContainer";

const Date = memo(function Date({ day }: { day: string }) {
    return (
        <Box paddingTop={1.5} marginX={2} textAlign="center">
            {day}
        </Box>
    );
});

export default function MessagesList(): React.ReactElement {
    const roomId = parseInt(useParams().id || "");
    const messageId = parseInt(useParams().messageId || "");
    const roomBlock = useGetRoomBlockedQuery(roomId);

    console.log({ roomBlock });

    const dispatch = useDispatch();
    const messages = useSelector(selectRoomMessages(roomId));
    const cursor = useSelector(selectCursor(roomId));
    const shouldDisplayBlockButton = useSelector(selectShouldDisplayBlockButton(roomId));

    const messagesSorted = useMemo(() => {
        const sorted = Object.values(messages).sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));

        return sorted.reduce((acc, curr, i) => {
            const day = dayjs.unix(curr.createdAt / 1000).format("dddd, MMM D");
            const message = {
                ...curr,
                previousMessageFromUserId: sorted[i - 1]?.fromUserId || null,
                nextMessageFromUserId: sorted[i + 1]?.fromUserId,
            };
            if (!acc[day]) {
                acc[day] = [message];
            } else {
                acc[day].push(message);
            }

            return acc;
        }, {}) as {
            [day: string]: (MessageType & {
                previousMessageFromUserId: number | null;
                nextMessageFromUserId: number | null;
            })[];
        };
    }, [messages]);

    useEffect(() => {
        if (typeof cursor === "undefined" || messageId) {
            dispatch(fetchMessages({ roomId, targetMessageId: messageId }));
        }
    }, [dispatch, roomId, messageId, cursor]);

    console.log({ shouldDisplayBlockButton });

    return (
        <>
            <MessagesContainer>
                {Object.entries(messagesSorted).map(([day, messages]) => {
                    return (
                        <Box key={day}>
                            <Date day={day} />

                            {messages.map((m) => {
                                return (
                                    <Message
                                        key={m.id}
                                        id={m.id}
                                        previousMessageFromUserId={m.previousMessageFromUserId}
                                        nextMessageFromUserId={m.nextMessageFromUserId}
                                    />
                                );
                            })}
                        </Box>
                    );
                })}
            </MessagesContainer>
            {shouldDisplayBlockButton && (
                <Box textAlign="center" my={2}>
                    <Button
                        color="error"
                        sx={{ bgcolor: "common.chatBackground" }}
                        startIcon={<DoDisturb />}
                    >
                        Block
                    </Button>
                </Box>
            )}
        </>
    );
}
