import { Box } from "@mui/material";
import dayjs from "dayjs";
import React, { memo, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import MessageType from "../../../../types/Message";
import {
    canLoadMoreMessages,
    fetchMessages,
    selectRoomMessages,
    selectRoomSendingMessages,
} from "../../slices/messages";
import Message from "./message";
import DeleteMessageDialog from "./message/DeleteMessageDialog";
import MessageDetailDialog from "./message/MessageDetailsModal";
import MessagesContainer from "./MessagesContainer";

const Date = memo(function Date({ day }: { day: string }) {
    return (
        <Box paddingTop={1.5} marginX={2} textAlign="center">
            {day}
        </Box>
    );
});

export default function RoomMessages(): React.ReactElement {
    const roomId = parseInt(useParams().id || "");

    const dispatch = useDispatch();
    const messages = useSelector(selectRoomMessages(roomId));
    const sendingMessages = useSelector(selectRoomSendingMessages(roomId));
    const canLoadMore = useSelector(canLoadMoreMessages(roomId));

    const messagesSorted = useMemo(() => {
        console.log("Calc mesages sorted");
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
        dispatch(fetchMessages({ roomId }));
    }, [dispatch, roomId]);

    const handleLoadMore = () => {
        if (canLoadMore) {
            dispatch(fetchMessages({ roomId }));
            return true;
        }

        return false;
    };

    return (
        <MessagesContainer onLoadMore={handleLoadMore}>
            {Object.entries(messagesSorted).map(([day, messages], i) => {
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
            {Object.values(sendingMessages).map((m) => (
                <Box
                    id={`sending_message_${m.localId}`}
                    bgcolor={m.status === "sending" ? "green" : "red"}
                    key={m.localId}
                >
                    {m.body.text}
                </Box>
            ))}
            <MessageDetailDialog />
            <DeleteMessageDialog />
        </MessagesContainer>
    );
}
