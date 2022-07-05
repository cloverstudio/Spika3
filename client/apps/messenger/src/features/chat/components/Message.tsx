import React, { useState } from "react";
import { Avatar, Box, Typography } from "@mui/material";

import MessageStatusIcon from "./MessageStatusIcon";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/userSlice";
import { useGetRoomQuery } from "../api/room";
import { useParams } from "react-router-dom";
import { InsertEmoticon } from "@mui/icons-material";
import ReactionOptions from "./ReactionOptions";
import MessageBody from "./MessageBody";
import MessageReactions from "./MessageReactions";
import { useGetMessageRecordsByIdQuery } from "../api/message";

type MessageProps = {
    id: number;
    fromUserId: number;
    seenCount: number;
    totalUserCount: number;
    deliveredCount: number;
    type: string;
    body: any;
    nextMessageSenderId?: number;
    previousMessageSenderId?: number;
    clickedAnchor: (event: React.MouseEvent<HTMLDivElement>, messageId: number) => void;
};

declare const UPLOADS_BASE_URL: string;

export default function Message({
    id,
    fromUserId,
    seenCount,
    totalUserCount,
    deliveredCount,
    type,
    body,
    nextMessageSenderId,
    previousMessageSenderId,
    clickedAnchor,
}: MessageProps): React.ReactElement {
    const roomId = +useParams().id;
    const { data: messageRecordsData } = useGetMessageRecordsByIdQuery(id);
    const messageReactions =
        messageRecordsData?.messageRecords.filter((mr) => mr.type === "reaction") || [];

    const user = useSelector(selectUser);
    const { data } = useGetRoomQuery(roomId);
    const users = data?.room?.users;
    const roomType = data?.room?.type;
    const sender = users?.find((u) => u.userId === fromUserId)?.user;
    const [showReactionOptions, setShowReactionOptions] = useState(false);

    const isUsersMessage = user?.id === fromUserId;
    const isFirstMessage = fromUserId !== previousMessageSenderId;
    const isLastMessage = fromUserId !== nextMessageSenderId;

    const getStatusIcon = () => {
        if (seenCount === totalUserCount) {
            return "seen";
        }

        if (deliveredCount === totalUserCount) {
            return "delivered";
        }

        return "sent";
    };

    const handleMessageClick = (e) => {
        e.preventDefault();
        clickedAnchor(e, id);
    };

    return (
        <Box
            key={id}
            sx={{
                "&:hover .reaction-btn": {
                    display: "flex",
                },
                position: "relative",
            }}
        >
            {roomType === "group" && !isUsersMessage && isFirstMessage && (
                <Typography color="text.tertiary" fontWeight={600} pl="34px" mb={0.5} mt={2}>
                    {sender?.displayName}
                </Typography>
            )}
            <Box
                display="flex"
                justifyContent={isUsersMessage ? "flex-end" : "flex-start"}
                mb={messageReactions.length ? "1.5rem" : "0.25rem"}
            >
                <Box
                    position="relative"
                    display="inline-flex"
                    alignItems="end"
                    justifyContent={isUsersMessage ? "flex-end" : "flex-start"}
                >
                    {roomType === "group" && !isUsersMessage && isLastMessage ? (
                        <Avatar
                            sx={{ width: 26, height: 26, mr: 1, mb: "0.375rem" }}
                            alt={sender?.displayName}
                            src={`${UPLOADS_BASE_URL}${sender?.avatarUrl}`}
                        />
                    ) : (
                        !isUsersMessage && <Box width="26px" mr={1}></Box>
                    )}

                    <MessageBody
                        id={id}
                        type={type}
                        body={body}
                        isUsersMessage={isUsersMessage}
                        onMessageClick={handleMessageClick}
                    />

                    <MessageReactions
                        messageReactions={messageReactions}
                        isUsersMessage={isUsersMessage}
                    />

                    {isUsersMessage && <MessageStatusIcon status={getStatusIcon()} />}
                    {!isUsersMessage && (
                        <Box
                            className="reaction-btn"
                            display="none"
                            alignItems="center"
                            position="absolute"
                            top="0"
                            bottom="0"
                            right={"-26px"}
                            sx={{ cursor: "pointer" }}
                            onClick={() => setShowReactionOptions((curr) => !curr)}
                        >
                            <InsertEmoticon />
                        </Box>
                    )}
                </Box>
            </Box>

            {showReactionOptions && (
                <ReactionOptions messageId={id} onClose={() => setShowReactionOptions(false)} />
            )}
        </Box>
    );
}
