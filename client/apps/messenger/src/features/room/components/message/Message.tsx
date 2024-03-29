import React, { memo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import { Box } from "@mui/material";
import Typography from "@mui/material/Typography";
import { useShowSnackBar } from "../../../../hooks/useModal";
import { selectUser } from "../../../../store/userSlice";
import { useGetRoomBlockedQuery, useGetRoomQuery } from "../../api/room";
import { setEditMessage, setReplyMessage } from "../../slices/input";
import {
    selectHasMessageReactions,
    selectMessageById,
    selectMessageStatus,
    selectTargetMessage,
    showDeleteModal,
    showMessageDetails,
} from "../../slices/messages";
import DatePopover from "./DatePopover";
import MessageBody from "./MessageBody";
import MessageContextMenu, { IconConfigs } from "./MessageContextMenu";
import ReactionOptionsPopover from "./ReactionOptionsPopover";
import MessageReactions from "./Reactions";
import StatusIcon from "./StatusIcon";

function useSender(id: number) {
    const roomId = parseInt(useParams().id || "");
    const { data: room } = useGetRoomQuery(roomId);

    if (!room) {
        return null;
    }

    return room.users?.find((u) => u.userId === id)?.user;
}

function useRoomType() {
    const roomId = parseInt(useParams().id || "");
    const { data: room } = useGetRoomQuery(roomId);

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
    const targetMessageId = useSelector(selectTargetMessage(roomId));

    const user = useSelector(selectUser);
    const status = useSelector(selectMessageStatus(roomId, id));
    const message = useSelector(selectMessageById(roomId, id));

    const [mouseOver, setMouseOver] = useState(false);
    const [showReactionMenu, setShowReactionMenu] = useState(false);

    const { fromUserId, createdAt, deleted, body } = message;

    const sender = useSender(fromUserId);
    const roomType = useRoomType();

    const isUsersMessage = message.fromUserId === user.id;
    const isFirstMessage = fromUserId !== previousMessageFromUserId;
    const isLastMessage = fromUserId !== nextMessageFromUserId;
    const isGroup = roomType === "group";
    const senderLabel = `${sender?.displayName || "Removed group user"} ${
        sender?.isBot ? " (bot)" : ""
    }`;
    const shouldDisplaySenderLabel = isGroup && !isUsersMessage && isFirstMessage;
    const shouldDisplayAvatar = isGroup && !isUsersMessage && isLastMessage;
    const shouldDisplayStatusIcons = isUsersMessage;

    const side = isUsersMessage ? "right" : "left";

    const handleMouseLeave = () => {
        setMouseOver(false);
        setShowReactionMenu(false);
    };

    const handleMouseEnter = () => {
        setMouseOver(true);
    };

    const handleImageMessageClick = () => {
        setMouseOver(false);
    };

    const highlighted = id === +targetMessageId;

    if (!body) {
        return null;
    }

    return (
        <MessageContainer
            id={id}
            side={isUsersMessage ? "right" : "left"}
            handleMouseLeave={handleMouseLeave}
        >
            {shouldDisplaySenderLabel && (
                <Typography lineHeight={1} color="text.tertiary" fontWeight={600} pl="34px" mt={2}>
                    {senderLabel}
                </Typography>
            )}

            <Box
                display="grid"
                gap={1}
                gridTemplateColumns={side === "right" || !isGroup ? "1fr" : "26px 1fr"}
            >
                {shouldDisplayAvatar ? (
                    <Box mt="auto" mr={1}>
                        <Avatar
                            sx={{ width: 26, height: 26 }}
                            src={`${UPLOADS_BASE_URL}/${sender?.avatarFileId}`}
                        />
                    </Box>
                ) : (
                    side === "left" && isGroup && <Box />
                )}
                <Box display="flex" position="relative">
                    {!deleted && <MessageReactions id={id} />}
                    <Box
                        onMouseEnter={handleMouseEnter}
                        border={highlighted ? "1px solid red" : ""}
                        sx={{
                            borderRadius: "0.3rem",
                            maxWidth: {
                                xs: "75vw",
                                md: "50vw",
                                lg: "30vw",
                                xl: "30vw",
                            },
                        }}
                    >
                        <MessageBodyContainer
                            id={id}
                            onImageMessageClick={handleImageMessageClick}
                        />
                    </Box>
                    {shouldDisplayStatusIcons && <StatusIcon status={status} id={id} />}
                    <DatePopover
                        mouseOver={mouseOver}
                        isUsersMessage={side === "right"}
                        createdAt={createdAt}
                    />
                    <Menu
                        id={id}
                        mouseOver={mouseOver}
                        setMouseOver={setMouseOver}
                        setShowReactionMenu={setShowReactionMenu}
                    />
                    <ReactionOptionsPopover
                        isUsersMessage={side === "right"}
                        show={showReactionMenu}
                        messageId={id}
                        handleClose={() => setShowReactionMenu(false)}
                    />
                </Box>
            </Box>
        </MessageContainer>
    );
}

type MessageContainerProps = {
    id: number;
    side: "left" | "right";
    children: React.ReactNode;
    handleMouseLeave: () => void;
};

function MessageContainer({ side, children, id, handleMouseLeave }: MessageContainerProps) {
    const roomId = parseInt(useParams().id || "");
    const hasReactions = useSelector(selectHasMessageReactions(roomId, id));

    return (
        <Box
            maxWidth="80%"
            id={`message_${id}`}
            sx={{
                display: "flex",
                ...(side === "right"
                    ? {
                          ml: "auto",
                          justifyContent: "end",
                      }
                    : { mr: "auto", justifyContent: "start" }),
            }}
        >
            <Box
                display="grid"
                gap={1}
                mb={hasReactions ? 3.5 : 0.5}
                onMouseLeave={handleMouseLeave}
                width="100%"
                sx={{ justifyContent: side === "right" ? "end" : "start" }}
            >
                {children}
            </Box>
        </Box>
    );
}

function MessageBodyContainer({
    id,
    onImageMessageClick,
}: {
    id: number;
    onImageMessageClick: () => void;
}) {
    const roomId = parseInt(useParams().id || "");
    const user = useSelector(selectUser);

    const message = useSelector(selectMessageById(roomId, id));
    const { fromUserId, body, type, replyId, deleted } = message;

    const isUsersMessage = fromUserId === user.id;
    const side = isUsersMessage ? "right" : "left";

    return (
        <MessageBody
            body={body}
            id={id}
            type={type}
            side={side}
            isReply={!!replyId}
            onImageMessageClick={onImageMessageClick}
            deleted={deleted}
        />
    );
}

type MenuProps = {
    id: number;
    mouseOver: boolean;
    setMouseOver: (boolean) => void;
    setShowReactionMenu: (boolean) => void;
};

function Menu({ id, mouseOver, setMouseOver, setShowReactionMenu }: MenuProps) {
    const roomId = parseInt(useParams().id || "");
    const user = useSelector(selectUser);
    const message = useSelector(selectMessageById(roomId, id));
    const { data: roomBlock } = useGetRoomBlockedQuery(roomId);

    const { fromUserId, deleted, type } = message;

    const isUsersMessage = fromUserId === user.id;

    const dispatch = useDispatch();
    const showSnackBar = useShowSnackBar();

    let contextMenuIcons = IconConfigs.showInfo;

    if (deleted) return null;

    if (roomBlock) {
        contextMenuIcons = IconConfigs.showInfo | IconConfigs.showDelete;
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
        <MessageContextMenu
            iconConfig={contextMenuIcons}
            mouseOver={mouseOver}
            isUsersMessage={isUsersMessage}
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

                const url = `${parsedUrl.origin}/messenger/rooms/${roomId}?messageId=${id}`;
                await navigator.clipboard.writeText(url);

                showSnackBar({
                    severity: "info",
                    text: "Permalink Copied",
                });
            }}
        />
    );
}

export default memo(Message);
