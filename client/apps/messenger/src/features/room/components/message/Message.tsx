import React, { memo, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import { Box, Slide, useMediaQuery, useTheme } from "@mui/material";
import Shortcut from "@mui/icons-material/Shortcut";
import ModeEditOutlineOutlined from "@mui/icons-material/ModeEditOutlineOutlined";
import Typography from "@mui/material/Typography";
import { useShowSnackBar } from "../../../../hooks/useModal";
import { selectUser } from "../../../../store/userSlice";
import { useGetRoomBlockedQuery, useGetRoomQuery } from "../../api/room";
import { setReplyMessage } from "../../slices/input";
import {
    hideMessageOptions,
    selectHasMessageReactions,
    selectKeyword,
    selectMessageById,
    selectMessageStatus,
    selectTargetMessage,
} from "../../slices/messages";
import MessageBody from "./MessageBody";
import MessageContextMenu, { IconConfigs } from "./MessageContextMenu";
import ReactionOptionsPopover from "./ReactionOptionsPopover";
import MessageReactions from "./Reactions";
import StatusIcon from "./StatusIcon";
import { useAppDispatch } from "../../../../hooks";
import EditedIndicator from "./MessageActionIndicator";
import MessageActionIndicator from "./MessageActionIndicator";
import useStrings from "../../../../hooks/useStrings";

function useSender(id: number) {
    const roomId = parseInt(useParams().id || "");
    const { data: room } = useGetRoomQuery(roomId);

    if (!room) {
        return null;
    }

    return room.users?.find((u) => u.userId === id)?.user;
}

export function useRoomType() {
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
    animate,
    separateWithMarginTop,
}: {
    id: number;
    previousMessageFromUserId: number | null;
    nextMessageFromUserId: number | null;
    animate: boolean;
    separateWithMarginTop: boolean;
}) {
    const roomId = parseInt(useParams().id || "");
    const targetMessageId = useSelector(selectTargetMessage(roomId));

    const user = useSelector(selectUser);
    const status = useSelector(selectMessageStatus(roomId, id));
    const message = useSelector(selectMessageById(roomId, id));
    const keyword = useSelector(selectKeyword(roomId));

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

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const strings = useStrings();

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

    const highlighted = id === +targetMessageId && !keyword;

    const renderAvatar = () => {
        if (!shouldDisplayAvatar) {
            return (side === "left" && isGroup && <Box />) || null;
        }

        if (animate) {
            return (
                <Slide direction="right" in={true}>
                    <Box mt="auto" mr={1}>
                        <Avatar
                            sx={{ width: 26, height: 26 }}
                            src={`${UPLOADS_BASE_URL}/${sender?.avatarFileId}`}
                        />
                    </Box>
                </Slide>
            );
        }

        return (
            <Box mt="auto" mr={1}>
                <Avatar
                    sx={{ width: 26, height: 26 }}
                    src={`${UPLOADS_BASE_URL}/${sender?.avatarFileId}`}
                />
            </Box>
        );
    };

    if (!body) {
        return null;
    }

    return (
        <MessageContainer id={id} side={side} handleMouseLeave={handleMouseLeave}>
            {shouldDisplaySenderLabel && (
                <Typography
                    lineHeight={1}
                    color="text.tertiary"
                    fontWeight={600}
                    pl="34px"
                    mt={2}
                    fontSize="13px"
                    marginBottom="-4px"
                >
                    {senderLabel}
                </Typography>
            )}

            <Box
                display="grid"
                gap={1}
                gridTemplateColumns={isUsersMessage || !isGroup ? "1fr" : "26px 1fr"}
                paddingLeft={isUsersMessage && !isMobile ? "150px" : "0px"}
                paddingRight={!isUsersMessage && !isMobile ? "150px" : "0px"}
                onMouseEnter={handleMouseEnter}
            >
                {renderAvatar()}
                <Box display="flex" position="relative">
                    {!deleted && <MessageReactions id={id} />}

                    <Box
                        sx={{
                            borderRadius: "0.3rem",
                            maxWidth: {
                                xs: "50vw",
                                md: "40vw",
                                lg: "40vw",
                                xl: "40vw",
                            },
                        }}
                    >
                        <Box position="relative">
                            <MessageBodyContainer
                                id={id}
                                onImageMessageClick={handleImageMessageClick}
                                animate={animate}
                                highlighted={highlighted}
                                separateWithMarginTop={separateWithMarginTop}
                            />
                            {!mouseOver &&
                                Math.abs(message.modifiedAt - message.createdAt) > 100 &&
                                !message.deleted && (
                                    <MessageActionIndicator
                                        isUsersMessage={isUsersMessage}
                                        actionTitle={strings.edited}
                                        icon={
                                            <ModeEditOutlineOutlined
                                                style={{
                                                    width: "16px",
                                                    height: "16px",
                                                    color: "#9AA0A6",
                                                }}
                                            />
                                        }
                                    />
                                )}
                            {!mouseOver && message.isForwarded && (
                                <MessageActionIndicator
                                    isUsersMessage={isUsersMessage}
                                    actionTitle={strings.forwarded}
                                    icon={
                                        <Shortcut
                                            style={{
                                                width: "14px",
                                                height: "14px",
                                                color: "#9AA0A6",
                                                marginRight: "2px",
                                            }}
                                        />
                                    }
                                />
                            )}

                            <Menu
                                id={id}
                                mouseOver={mouseOver}
                                showReactionMenu={showReactionMenu}
                                setShowReactionMenu={setShowReactionMenu}
                                setMouseOver={setMouseOver}
                                createdAt={createdAt}
                            />
                        </Box>
                    </Box>
                    {shouldDisplayStatusIcons && <StatusIcon status={status} id={id} />}

                    {isMobile && (
                        <Box zIndex={1100}>
                            <ReactionOptionsPopover
                                isUsersMessage={isUsersMessage}
                                show={showReactionMenu}
                                messageId={id}
                                handleClose={() => setShowReactionMenu(false)}
                                setMouseOver={setMouseOver}
                                setShowReactionMenu={setShowReactionMenu}
                            />
                        </Box>
                    )}
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
    const message = useSelector(selectMessageById(roomId, id));

    const dispatch = useAppDispatch();

    return (
        <Box
            maxWidth="100%"
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
            onClick={(e) => {
                if (e.detail === 2 && !message.deleted) {
                    dispatch(setReplyMessage({ roomId, message }));
                }
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
    animate,
    highlighted,
    separateWithMarginTop,
}: {
    id: number;
    onImageMessageClick: () => void;
    animate: boolean;
    highlighted: boolean;
    separateWithMarginTop: boolean;
}) {
    const roomId = parseInt(useParams().id || "");
    const user = useSelector(selectUser);

    const message = useSelector(selectMessageById(roomId, id));
    const { fromUserId, body, type, replyId, deleted, progress } = message;
    const roomType = useRoomType();

    const isGroup = roomType === "group";

    const isUsersMessage = fromUserId === user.id;
    const side = isUsersMessage ? "right" : "left";

    if (!isUsersMessage && !progress && !deleted && animate) {
        return (
            <Slide
                direction={side === "right" ? "left" : "right"}
                in={true}
                mountOnEnter
                unmountOnExit
            >
                <Box marginTop={separateWithMarginTop && !isGroup ? "8px" : "4px"}>
                    <MessageBody
                        body={body}
                        type={type}
                        side={side}
                        isReply={!!replyId}
                        onImageMessageClick={onImageMessageClick}
                        deleted={deleted}
                        progress={progress}
                        highlighted={highlighted}
                        id={id}
                    />
                </Box>
            </Slide>
        );
    }

    return (
        <Box marginTop={separateWithMarginTop && !isGroup ? "8px" : "4px"}>
            <MessageBody
                body={body}
                type={type}
                side={side}
                isReply={!!replyId}
                onImageMessageClick={onImageMessageClick}
                deleted={deleted}
                progress={progress}
                highlighted={highlighted}
                id={id}
            />
        </Box>
    );
}

type MenuProps = {
    id: number;
    mouseOver: boolean;
    setMouseOver: (boolean) => void;
    createdAt: number;
    showReactionMenu: boolean;
    setShowReactionMenu: (boolean) => void;
};

function Menu({
    id,
    mouseOver,
    setMouseOver,
    createdAt,
    showReactionMenu,
    setShowReactionMenu,
}: MenuProps) {
    const roomId = parseInt(useParams().id || "");
    const user = useSelector(selectUser);
    const message = useSelector(selectMessageById(roomId, id));
    const { data: roomBlock } = useGetRoomBlockedQuery(roomId);

    const { fromUserId, deleted, type } = message;

    const isUsersMessage = fromUserId === user.id;

    const dispatch = useAppDispatch();
    const showSnackBar = useShowSnackBar();

    let contextMenuIcons = IconConfigs.showInfo;

    if (deleted) return null;

    if (roomBlock) {
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
        <MessageContextMenu
            iconConfig={contextMenuIcons}
            mouseOver={mouseOver}
            setMouseOver={setMouseOver}
            id={id}
            roomId={roomId}
            isUsersMessage={isUsersMessage}
            createdAt={createdAt}
            setShowReactionMenu={setShowReactionMenu}
            showReactionMenu={showReactionMenu}
            handleEmoticon={() => {
                if (showReactionMenu) {
                    setShowReactionMenu(false);
                } else {
                    setShowReactionMenu(true);
                }
                dispatch(hideMessageOptions(roomId));
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
