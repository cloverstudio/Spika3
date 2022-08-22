import React, { useRef } from "react";
import { Avatar, Box, Typography } from "@mui/material";

import MessageStatusIcon from "./MessageStatusIcon";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/userSlice";
import { useGetRoomQuery } from "../api/room";
import { useParams } from "react-router-dom";

import MessageBody from "./MessageBody";
import MessageReactions from "./MessageReactions";
import { useGetMessageRecordsByIdQuery } from "../api/message";
import getMessageStatus from "../lib/getMessageStatus";
import ReactionOptionsPopover from "./ReactionOptionsPopover";
import DatePopover from "./DatePopover";
import MessageContectMenu from "./MessageContectMenu";
import { OnlinePredictionTwoTone } from "@mui/icons-material";

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
    showMessageDetails: (id: number) => void;
    onDelete: (id: number) => void;
    onEdit: (id: number) => void;
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
    showMessageDetails,
    onDelete,
    onEdit,
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
    const [mouseOver, setMouseOver] = React.useState<boolean>(false);
    const [showReactionMenu, setShowReactionMenu] = React.useState<boolean>(false);

    const isUsersMessage = user?.id === fromUserId;
    const isFirstMessage = fromUserId !== previousMessageSenderId;
    const isLastMessage = fromUserId !== nextMessageSenderId;

    return (
        <Box
            sx={{
                position: "relative",
            }}
            onMouseLeave={() => {
                setMouseOver(false);
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
                onMouseEnter={() => {
                    setMouseOver(true);
                }}
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

                    <Box>
                        <MessageBody
                            id={id}
                            type={type}
                            body={body}
                            isUsersMessage={isUsersMessage}
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
                            display={mouseOver ? "flex" : "none"}
                            alignItems="center"
                            position="absolute"
                            top="0"
                            bottom="0"
                            right={"-26px"}
                            sx={{ cursor: "pointer" }}
                        ></Box>
                    )}

                    <DatePopover
                        mouseOver={mouseOver}
                        isUsersMessage={isUsersMessage}
                        createdAt={createdAt}
                        handleClose={() => setMouseOver(false)}
                    />

                    <MessageContectMenu
                        mouseOver={mouseOver}
                        isUsersMessage={isUsersMessage}
                        handleClose={() => setMouseOver(false)}
                        handleEmoticon={(e) => {
                            setShowReactionMenu(true);
                            setMouseOver(false);
                        }}
                        handleInfo={(e) => {
                            showMessageDetails(id);
                        }}
                        handleDelete={(e) => {
                            onDelete(id);
                        }}
                        handleEdit={(e) => {
                            onEdit(id);
                        }}
                    />
                    <ReactionOptionsPopover
                        isUsersMessage={isUsersMessage}
                        show={showReactionMenu}
                        messageId={id}
                        handleClose={() => setShowReactionMenu(false)}
                    />
                </Box>
            </Box>
        </Box>
    );
}
