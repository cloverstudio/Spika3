import { Avatar, Box, Typography } from "@mui/material";
import React, { memo, ReactElement, ReactNode, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useShowSnackBar } from "../../../../../hooks/useModal";
import { selectUser } from "../../../../../store/userSlice";
import MessageType from "../../../../../types/Message";
import { useGetRoom2Query } from "../../../api/room";
import { setEditMessage, setReplyMessage } from "../../../slices/input";
import {
    selectHasMessageReactions,
    selectMessageById,
    selectMessageStatus,
    showDeleteModal,
    showMessageDetails,
} from "../../../slices/messages";
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
    const status = useSelector(selectMessageStatus(roomId, id));
    const message = useSelector(selectMessageById(roomId, id));

    const dispatch = useDispatch();
    const [mouseOver, setMouseOver] = useState(false);
    const [showReactionMenu, setShowReactionMenu] = useState(false);

    const showSnackBar = useShowSnackBar();

    const { fromUserId, createdAt, deleted, type } = message;

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

    const handleMouseLeave = () => {
        setMouseOver(false);
        setShowReactionMenu(false);
    };

    const handleMouseEnter = () => {
        setMouseOver(true);
    };

    const Menu = () => (
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
    );
    const ReactionOptions = () => (
        <ReactionOptionsPopover
            isUsersMessage={side === "right"}
            show={showReactionMenu}
            messageId={id}
            handleClose={() => setShowReactionMenu(false)}
        />
    );

    const DateInfo = () => (
        <DatePopover
            mouseOver={mouseOver}
            isUsersMessage={side === "right"}
            createdAt={createdAt}
        />
    );

    return (
        <MessageContainer
            id={id}
            side={isUsersMessage ? "right" : "left"}
            handleMouseLeave={handleMouseLeave}
        >
            <MessageContent
                side={side}
                id={id}
                displayName={displayName}
                avatarUrl={avatarUrl}
                status={isUsersMessage ? status : ""}
                message={message}
                handleMouseEnter={handleMouseEnter}
                Menu={<Menu />}
                ReactionOptions={<ReactionOptions />}
                DateInfo={<DateInfo />}
            />
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
                          textAlign: "right",
                          ml: "auto",
                          justifyContent: "end",
                      }
                    : { textAlign: "left", mr: "auto", justifyContent: "start" }),
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

type MessageContentProps = {
    id: number;
    side: "left" | "right";
    displayName?: string;
    avatarUrl?: string;
    status?: string;
    message: MessageType;
    handleMouseEnter: () => void;
    Menu: ReactNode;
    ReactionOptions: ReactNode;
    DateInfo: ReactNode;
};

function MessageContent({
    id,
    displayName,
    avatarUrl,
    side,
    status,
    handleMouseEnter,
    Menu,
    ReactionOptions,
    DateInfo,
}: MessageContentProps) {
    return (
        <>
            {displayName && (
                <Typography lineHeight={1} color="text.tertiary" fontWeight={600} pl="34px" mt={2}>
                    {displayName}
                </Typography>
            )}
            <Box
                display="grid"
                gap={1}
                gridTemplateColumns={side === "right" || !avatarUrl ? "1fr" : "26px 1fr"}
            >
                {avatarUrl ? (
                    <Avatar
                        sx={{ width: 26, height: 26, mr: 1, mb: "0.375rem" }}
                        src={`${UPLOADS_BASE_URL}${avatarUrl}`}
                    />
                ) : (
                    side === "left" && <Box />
                )}
                <Box display="flex" position="relative">
                    <Box onMouseEnter={handleMouseEnter}>
                        <MessageBodyContainer id={id} />
                    </Box>
                    {status && <StatusIcon status={status} />}
                    <MessageReactions id={id} />
                    {DateInfo}
                    {Menu}
                    {ReactionOptions}
                </Box>
            </Box>
        </>
    );
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
