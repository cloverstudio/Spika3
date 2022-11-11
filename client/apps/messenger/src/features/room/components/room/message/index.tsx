import { Avatar, Box, Typography } from "@mui/material";
import React, { memo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useShowSnackBar } from "../../../../../hooks/useModal";
import { selectUser } from "../../../../../store/userSlice";
import MessageType, { MessageRecordType } from "../../../../../types/Message";
import { useGetRoom2Query } from "../../../api/room";
import getMessageStatus from "../../../lib/getMessageStatus";
import { setEditMessage, setReplyMessage } from "../../../slices/input";
import { selectMessageById, showDeleteModal, showMessageDetails } from "../../../slices/messages";
import DatePopover from "./DatePopover";
import MessageBody from "./MessageBody";
import MessageContextMenu, { IconConfigs } from "./MessageContextMenu";
import ReactionOptionsPopover from "./ReactionOptionsPopover";
import MessageReactions from "./Reactions";
import StatusIcon from "./StatusIcon";

function useSender(id: number) {
    const roomId = parseInt(useParams().id || "");
    const { data: room } = useGetRoom2Query(roomId);

    if (!room) {
        return null;
    }

    return room.users?.find((u) => u.userId === id)?.user;
}

function useRoomType() {
    const roomId = parseInt(useParams().id || "");
    const { data: room } = useGetRoom2Query(roomId);

    if (!room) {
        return null;
    }

    return room.type;
}

function Message({
    id,
    previousMessageFromUserId,
    nextMessageFromUserId,
}: {
    id: number;
    previousMessageFromUserId: number | null;
    nextMessageFromUserId: number | null;
}) {
    const roomId = parseInt(useParams().id || "");
    const user = useSelector(selectUser);

    const message = useSelector(selectMessageById(roomId, id));
    const {
        fromUserId,
        body,
        totalUserCount,
        deliveredCount,
        seenCount,
        messageRecords,
        createdAt,
        deleted,
        type,
        status,
    } = message;

    const sender = useSender(fromUserId);
    const roomType = useRoomType();

    const isUsersMessage = message.fromUserId === user.id;
    const isFirstMessage = fromUserId !== previousMessageFromUserId;
    const isLastMessage = fromUserId !== nextMessageFromUserId;

    const avatarUrl = roomType === "group" && !isUsersMessage && isLastMessage && sender.avatarUrl;
    const displayName =
        roomType === "group" &&
        !isUsersMessage &&
        isFirstMessage &&
        `${sender?.displayName || "Removed group user"} ${sender?.isBot ? " (bot)" : ""}`;

    const side = isUsersMessage ? "right" : "left";
    const messageStatus = status
        ? status
        : isUsersMessage && getMessageStatus({ totalUserCount, deliveredCount, seenCount });

    let contextMenuIcons = IconConfigs.showInfo;

    if (deleted) {
        contextMenuIcons = IconConfigs.showInfo;
    } else if (isUsersMessage && type === "text") {
        contextMenuIcons =
            IconConfigs.showEmoticon |
            IconConfigs.showInfo |
            IconConfigs.showEdit |
            IconConfigs.showReply |
            IconConfigs.showDelete;
    } else if (isUsersMessage) {
        contextMenuIcons =
            IconConfigs.showEmoticon |
            IconConfigs.showInfo |
            IconConfigs.showReply |
            IconConfigs.showDelete;
    } else {
        contextMenuIcons = IconConfigs.showEmoticon | IconConfigs.showInfo | IconConfigs.showReply;
    }

    return (
        <MessageContainer id={id} side={isUsersMessage ? "right" : "left"}>
            {roomType === "group" ? (
                <GroupMessage
                    side={side}
                    id={id}
                    displayName={displayName}
                    avatarUrl={avatarUrl}
                    status={messageStatus}
                    messageReactions={messageRecords.filter((mr) => mr.type === "reaction")}
                    createdAt={createdAt}
                    contextMenuIcons={contextMenuIcons}
                    message={message}
                />
            ) : (
                <PrivateMessage body={body} />
            )}
        </MessageContainer>
    );
}

type MessageContainerProps = {
    id: number;
    side: "left" | "right";
    children: React.ReactNode;
};

function MessageContainer({ side, children, id }: MessageContainerProps) {
    return (
        <Box
            maxWidth="80%"
            id={`message_${id}`}
            sx={{
                display: "flex",
                ...(side === "right"
                    ? {
                          textAlign: "right",
                          ml: "auto",
                          justifyContent: "end",
                      }
                    : { textAlign: "left", mr: "auto", justifyContent: "start" }),
            }}
        >
            {children}
        </Box>
    );
}

type GroupMessageProps = {
    id: number;
    side: "left" | "right";
    messageReactions: MessageRecordType[];
    createdAt: number;
    contextMenuIcons: any;
    displayName?: string;
    avatarUrl?: string;
    status?: string;
    message: MessageType;
};

function GroupMessage({
    id,
    displayName,
    avatarUrl,
    side,
    status,
    messageReactions,
    createdAt,
    contextMenuIcons,
    message,
}: GroupMessageProps) {
    const roomId = parseInt(useParams().id || "");
    const dispatch = useDispatch();
    const [mouseOver, setMouseOver] = useState(false);
    const [showReactionMenu, setShowReactionMenu] = useState(false);

    const showSnackBar = useShowSnackBar();

    return (
        <Box
            display="grid"
            gap={1}
            mb={messageReactions.length ? 3.5 : 0.5}
            onMouseLeave={() => {
                setMouseOver(false);
                setShowReactionMenu(false);
            }}
            width="100%"
            sx={{ justifyContent: side === "right" ? "end" : "start" }}
        >
            {displayName && (
                <Typography lineHeight={1} color="text.tertiary" fontWeight={600} pl="34px" mt={2}>
                    {displayName}
                </Typography>
            )}
            <Box display="grid" gap={1} gridTemplateColumns={side === "right" ? "1fr" : "26px 1fr"}>
                {avatarUrl ? (
                    <Avatar
                        sx={{ width: 26, height: 26, mr: 1, mb: "0.375rem" }}
                        src={`${UPLOADS_BASE_URL}${avatarUrl}`}
                    />
                ) : (
                    side === "left" && <Box />
                )}
                <Box display="flex" position="relative">
                    <Box
                        onMouseEnter={() => {
                            setMouseOver(true);
                        }}
                    >
                        <MessageBodyContainer id={id} />
                    </Box>
                    {status && <StatusIcon status={status} />}
                    <MessageReactions
                        messageReactions={messageReactions}
                        isUsersMessage={side === "right"}
                    />
                    <DatePopover
                        mouseOver={mouseOver}
                        isUsersMessage={side === "right"}
                        createdAt={createdAt}
                    />
                    <MessageContextMenu
                        iconConfig={contextMenuIcons}
                        mouseOver={mouseOver}
                        isUsersMessage={side === "right"}
                        handleClose={() => setMouseOver(false)}
                        handleEmoticon={() => {
                            setShowReactionMenu(true);
                            setMouseOver(false);
                        }}
                        handleInfo={() => {
                            dispatch(showMessageDetails({ roomId, messageId: id }));
                        }}
                        handleDelete={() => {
                            dispatch(showDeleteModal({ roomId, messageId: id }));
                        }}
                        handleEdit={() => {
                            dispatch(setEditMessage({ roomId, message }));
                        }}
                        handleReply={() => {
                            dispatch(setReplyMessage({ roomId, message }));
                        }}
                        handleShare={async () => {
                            const parsedUrl = new URL(window.location.href);

                            const url = `${parsedUrl.origin}/messenger/rooms/${roomId}/${id}`;
                            await navigator.clipboard.writeText(url);

                            showSnackBar({
                                severity: "info",
                                text: "Permalink Copied",
                            });
                        }}
                    />
                    <ReactionOptionsPopover
                        isUsersMessage={side === "right"}
                        show={showReactionMenu}
                        messageId={id}
                        handleClose={() => setShowReactionMenu(false)}
                    />
                </Box>
            </Box>
        </Box>
    );
}

type PrivateMessageProps = {
    body: any;
};

function PrivateMessage({ body }: PrivateMessageProps) {
    return <Box>{body.text}</Box>;
}

function MessageBodyContainer({ id }: { id: number }) {
    const roomId = parseInt(useParams().id || "");
    const user = useSelector(selectUser);

    const message = useSelector(selectMessageById(roomId, id));
    const { fromUserId, body, type, reply } = message;

    const isUsersMessage = fromUserId === user.id;
    const side = isUsersMessage ? "right" : "left";

    return <MessageBody body={body} id={id} type={type} side={side} isReply={reply} />;
}

export default memo(Message);
