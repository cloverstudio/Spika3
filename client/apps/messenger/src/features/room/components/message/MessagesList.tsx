import React, { memo, useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import DoDisturb from "@mui/icons-material/DoDisturb";
import { Box } from "@mui/material";
import Button from "@mui/material/Button";
import { useShowBasicDialog } from "../../../../hooks/useModal";
import useStrings from "../../../../hooks/useStrings";
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

    const messagesSorted = useMemo(
        () =>
            Object.values(messages)
                .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
                .map((m, i, all) => ({
                    ...m,
                    previousMessageFromUserId: all[i - 1]?.fromUserId || null,
                    nextMessageFromUserId: all[i + 1]?.fromUserId,
                })),
        [messages]
    );

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
                {messagesSorted.map((m, i) => (
                    <Message
                        key={m.id}
                        id={m.id}
                        previousMessageFromUserId={i !== 0 && m.previousMessageFromUserId}
                        nextMessageFromUserId={m.nextMessageFromUserId}
                    />
                ))}
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
