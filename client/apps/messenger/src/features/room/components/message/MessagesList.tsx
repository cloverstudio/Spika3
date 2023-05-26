import React, { memo, useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import DoDisturb from "@mui/icons-material/DoDisturb";
import { Box } from "@mui/material";
import Button from "@mui/material/Button";
import dayjs from "dayjs";
import { useShowBasicDialog } from "../../../../hooks/useModal";
import useStrings from "../../../../hooks/useStrings";
import MessageType from "../../../../types/Message";
import { useBlockUserMutation } from "../../api/user";
import {
    fetchMessages,
    selectCursor,
    selectOtherUserIdInPrivateRoom,
    selectRoomMessages,
    selectShouldDisplayBlockButton,
    selectTargetMessage,
    selectTargetMessageIsInList,
    setTargetMessage,
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
    const [searchParams] = useSearchParams();
    const messageId = searchParams.get("messageId");
    const targetMessageId = useSelector(selectTargetMessage(roomId));
    const targetMessageIsInMessageList = useSelector(selectTargetMessageIsInList(roomId));
    const strings = useStrings();
    const showBasicDialog = useShowBasicDialog();

    const [blockUser] = useBlockUserMutation();

    const dispatch = useDispatch();
    const messages = useSelector(selectRoomMessages(roomId));
    const cursor = useSelector(selectCursor(roomId));
    const shouldDisplayBlockButton = useSelector(selectShouldDisplayBlockButton(roomId));
    const otherUserId = useSelector(selectOtherUserIdInPrivateRoom(roomId));

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
        if (messageId) {
            dispatch(setTargetMessage({ roomId, messageId: +messageId }));
        }

        return () => {
            dispatch(setTargetMessage({ roomId, messageId: null }));
        };
    }, [dispatch, messageId, roomId]);

    useEffect(() => {
        if (typeof cursor === "undefined" && !targetMessageId) {
            dispatch(fetchMessages({ roomId }));
        } else if (targetMessageId && !targetMessageIsInMessageList) {
            dispatch(fetchMessages({ roomId, targetMessageId }));
        }
    }, [dispatch, roomId, targetMessageId, cursor, targetMessageIsInMessageList]);

    const handleBlock = () => {
        showBasicDialog(
            {
                text: strings.blockUserQuestion,
                title: strings.confirm,
                allowButtonLabel: strings.yes,
                denyButtonLabel: strings.cancel,
            },
            () => {
                blockUser(otherUserId)
                    .unwrap()
                    .then(() => {
                        console.log("done");
                    });
            }
        );
    };

    return (
        <>
            <MessagesContainer>
                {Object.entries(messagesSorted).map(([day, messages]) => {
                    return (
                        <Box key={day}>
                            <Date day={day} />

                            {messages.map((m, i) => {
                                return (
                                    <Message
                                        key={m.id}
                                        id={m.id}
                                        previousMessageFromUserId={
                                            i !== 0 && m.previousMessageFromUserId
                                        }
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
                        onClick={handleBlock}
                    >
                        {strings.blockUser}
                    </Button>
                </Box>
            )}
        </>
    );
}
