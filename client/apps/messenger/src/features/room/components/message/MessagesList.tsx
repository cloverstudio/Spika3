import React, { memo, useContext, useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import dayjs from "dayjs";

import DoDisturb from "@mui/icons-material/DoDisturb";
import { Box } from "@mui/material";
import Button from "@mui/material/Button";
import { useShowBasicDialog } from "../../../../hooks/useModal";
import useStrings from "../../../../hooks/useStrings";
import { useBlockUserMutation } from "../../api/user";
import {
    fetchMessages,
    fetchTargetMessageBatch,
    resetTargetMessageBatchProperties,
    selectCursor,
    selectIsSelectingMessagesActive,
    selectOtherUserIdInPrivateRoom,
    selectRoomMessages,
    selectShouldDisplayBlockButton,
    selectTargetMessage,
    selectTargetMessageIsInList,
    setFetchingTargetMessageBatchEnabled,
    setIsInitialTargetMessageBatch,
    setTargetMessage,
} from "../../slices/messages";
import Message from "./Message";
import MessagesContainer from "./MessagesContainer";
import MessageType from "../../../../types/Message";
import { ThemeContext } from "../../../../theme";
import { useAppDispatch, useAppSelector } from "../../../../hooks";
import SystemMessage from "./messageTypes/system/SystemMessage";

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

    const dispatch = useAppDispatch();
    const messages = useSelector(selectRoomMessages(roomId));

    const cursor = useSelector(selectCursor(roomId));

    const shouldDisplayBlockButton = useSelector(selectShouldDisplayBlockButton(roomId));
    const otherUserId = useSelector(selectOtherUserIdInPrivateRoom(roomId));
    const fetchingTargetMessageBatchEnabled = useAppSelector(
        (state) => state.messages[roomId]?.fetchingTargetMessageBatchEnabled,
    );

    const isSelectingMessagesActive = useSelector(selectIsSelectingMessagesActive(roomId));

    const { theme } = useContext(ThemeContext);

    const bgColor = theme === "light" ? "#F9F9F9" : "#282828";

    const messagesSorted = useMemo(() => {
        const sorted = Object.values(messages || {}).sort((a, b) =>
            a.createdAt > b.createdAt ? 1 : -1,
        );

        return sorted.reduce((acc, curr, i) => {
            const day = dayjs.unix(curr.createdAt / 1000).format("dddd, MMM D");
            const message = {
                ...curr,
                previousMessageFromUserId: sorted[i - 1]?.fromUserId || null,
                nextMessageFromUserId: sorted[i + 1]?.fromUserId,
                separateWithMarginTop: sorted[i - 1]?.fromUserId !== curr.fromUserId,
                isNextMessageSystems: sorted[i + 1]?.type === "system",
                wasPreviousMessageSystems: sorted[i - 1]?.type === "system",
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
                separateWithMarginTop: boolean;
                isNextMessageSystems: boolean;
                wasPreviousMessageSystems: boolean;
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
        if (
            typeof cursor === "undefined" &&
            !targetMessageId &&
            !fetchingTargetMessageBatchEnabled
        ) {
            dispatch(fetchMessages({ roomId }));
        } else if (targetMessageId && !targetMessageIsInMessageList) {
            dispatch(resetTargetMessageBatchProperties(roomId));
            dispatch(
                setFetchingTargetMessageBatchEnabled({
                    roomId,
                    fetchingTargetMessageBatchEnabled: true,
                }),
            );
            dispatch(setIsInitialTargetMessageBatch({ roomId, isInitialTargetMessageBatch: true }));
            dispatch(
                fetchTargetMessageBatch({
                    roomId,
                    targetMessageId,
                }),
            );
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
            },
        );
    };

    return (
        <>
            <MessagesContainer bgColor={bgColor}>
                {Object.entries(messagesSorted).map(([day, messages], dayIndex) => {
                    const isLastDay = dayIndex === Object.keys(messagesSorted).length - 1;
                    return (
                        <Box key={day}>
                            <Date day={day} />

                            {messages.map((m, i) => {
                                const isLastMessageInDay = i === messages.length - 1;

                                if (m.type === "system") {
                                    return (
                                        <SystemMessage
                                            key={m.id}
                                            body={m.body}
                                            createdAt={m.createdAt}
                                        />
                                    );
                                }
                                return (
                                    <Message
                                        key={m.id}
                                        id={m.id}
                                        previousMessageFromUserId={
                                            i !== 0 && m.previousMessageFromUserId
                                        }
                                        nextMessageFromUserId={m.nextMessageFromUserId}
                                        animate={isLastDay && isLastMessageInDay}
                                        separateWithMarginTop={m.separateWithMarginTop}
                                        isNextMessageSystems={m.isNextMessageSystems}
                                        wasPreviousMessageSystems={m.wasPreviousMessageSystems}
                                        isSelectingMessagesActive={isSelectingMessagesActive}
                                    />
                                );
                            })}
                        </Box>
                    );
                })}
            </MessagesContainer>

            {shouldDisplayBlockButton && (
                <Box textAlign="center" py={2} bgcolor={bgColor}>
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
