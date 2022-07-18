import React, { useRef } from "react";
import { Avatar, Box, Typography } from "@mui/material";

import MessageStatusIcon from "./MessageStatusIcon";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/userSlice";
import { useGetRoomQuery } from "../api/room";
import { useParams } from "react-router-dom";
import { InsertEmoticon } from "@mui/icons-material";
import MessageBody from "./MessageBody";
import MessageReactions from "./MessageReactions";
import { useGetMessageRecordsByIdQuery } from "../api/message";
import getMessageStatus from "../lib/getMessageStatus";
import ReactionOptionsPopover from "./ReactionOptionsPopover";
import DatePopover from "./DatePopover";

type MessageRowProps = {
    id: number;
    fromUserId: number;
    seenCount: number;
    totalUserCount: number;
    deliveredCount: number;
    type: string;
    body: any;
    createdAt: any;
    nextMessageSenderId?: number;
    previousMessageSenderId?: number;
    clickedAnchor: (event: React.MouseEvent<HTMLDivElement>, messageId: number) => void;
};

declare const UPLOADS_BASE_URL: string;

export default function MessageRow({
    id,
    fromUserId,
    seenCount,
    totalUserCount,
    deliveredCount,
    type,
    body,
    nextMessageSenderId,
    previousMessageSenderId,
    createdAt,
    clickedAnchor,
}: MessageRowProps): React.ReactElement {
    const roomId = +useParams().id;
    const { data: messageRecordsData } = useGetMessageRecordsByIdQuery(id);
    const messageReactions =
        messageRecordsData?.messageRecords.filter((mr) => mr.type === "reaction") || [];

    const user = useSelector(selectUser);
    const { data } = useGetRoomQuery(roomId);
    const users = data?.room?.users;
    const roomType = data?.room?.type;
    const sender = users?.find((u) => u.userId === fromUserId)?.user;
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
    const [anchorElCreatedAt, setAnchorElCreatedAt] = React.useState<HTMLElement | null>(null);

    const isUsersMessage = user?.id === fromUserId;
    const isFirstMessage = fromUserId !== previousMessageSenderId;
    const isLastMessage = fromUserId !== nextMessageSenderId;

    const anchorRef = useRef<HTMLDivElement>();

    const handleMessageClick = (e) => {
        e.preventDefault();
        clickedAnchor(e, id);
    };

    const handlePopoverOpen = () => {
        setAnchorEl(anchorRef.current);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
        setAnchorElCreatedAt(null);
    };

    const handlePopoverTimeOpen = () => {
        setAnchorElCreatedAt(anchorRef.current);
    };

    return (
        <Box
            sx={{
                "&:hover .reaction-btn": {
                    display: "flex",
                },
                position: "relative",
            }}
            onMouseLeave={handlePopoverClose}
            ref={anchorRef}
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

                    <Box onMouseEnter={handlePopoverTimeOpen}>
                        <MessageBody
                            id={id}
                            type={type}
                            body={body}
                            isUsersMessage={isUsersMessage}
                            onMessageClick={handleMessageClick}
                        />
                    </Box>

                    <MessageReactions
                        messageReactions={messageReactions}
                        isUsersMessage={isUsersMessage}
                    />

                    {isUsersMessage && (
                        <MessageStatusIcon
                            status={getMessageStatus({ totalUserCount, deliveredCount, seenCount })}
                        />
                    )}
                    {!isUsersMessage && (
                        <Box
                            className="reaction-btn"
                            display={Boolean(anchorEl) ? "flex" : "none"}
                            alignItems="center"
                            position="absolute"
                            top="0"
                            bottom="0"
                            right={"-26px"}
                            sx={{ cursor: "pointer" }}
                        >
                            <InsertEmoticon onMouseEnter={handlePopoverOpen} />
                        </Box>
                    )}
                </Box>
            </Box>
            <ReactionOptionsPopover
                anchorEl={anchorEl}
                messageId={id}
                handleClose={() => handlePopoverClose()}
            />
            <DatePopover
                anchorEl={anchorElCreatedAt}
                isUsersMessage={isUsersMessage}
                createdAt={createdAt}
                handleClose={() => handlePopoverClose()}
            />
        </Box>
    );
}
