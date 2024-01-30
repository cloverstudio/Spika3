import React, { useEffect, useRef, useState } from "react";

import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";

import { reactionEmojis } from "../../lib/consts";
import {
    selectMessageById,
    selectMessageReactions,
    showCustomEmojiModal,
} from "../../slices/messages";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import AddIcon from "@mui/icons-material/Add";
import { useAppDispatch, useAppSelector } from "../../../../hooks";
import useReactions from "../../../../hooks/useReactions";
import { useMessageContainerContext } from "./MessagesContainer";
import { selectRightSidebarOpen } from "../../slices/rightSidebar";

type ReactionOptionsPopoverProps = {
    isUsersMessage: boolean;
    messageId: number;
    handleClose: () => void;
    show: boolean;
    setShowReactionMenu: (show: boolean) => void;
    setMouseOver: (show: boolean) => void;
};

export default function ReactionOptionsPopover({
    isUsersMessage,
    messageId,
    handleClose,
    show,
    setShowReactionMenu,
    setMouseOver,
}: ReactionOptionsPopoverProps): React.ReactElement {
    const roomId = parseInt(useParams().id || "");
    const dispatch = useAppDispatch();
    const { toggleReaction } = useReactions();
    const message = useAppSelector(selectMessageById(roomId, messageId));
    const replyMessage = useAppSelector(selectMessageById(roomId, message?.replyId));

    const isRightSidebarOpen = useSelector(selectRightSidebarOpen);

    const indentReactionPopover =
        isRightSidebarOpen &&
        (message.body.text?.length > 70 || replyMessage?.body.text?.length > 70);

    const reactions = useSelector(selectMessageReactions(roomId, messageId));
    const { messageContainerRef } = useMessageContainerContext();
    const reactionMenuRef = useRef(null);

    const [positionBottom, setPositionBottom] = useState("");
    const [positionTop, setPositionTop] = useState("");

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const isDarkTheme = theme.palette.mode === "dark";

    useEffect(() => {
        if (!messageContainerRef.current || !reactionMenuRef.current) return;

        if (isMobile) return setPositionBottom("-64px");

        const messageContainerRect = messageContainerRef.current.getBoundingClientRect();
        const reactionMenuRect = reactionMenuRef.current.getBoundingClientRect();

        if (reactionMenuRect.top + reactionMenuRect.height / 2 > messageContainerRect.height) {
            setPositionTop("-76px");
        } else {
            setPositionBottom("-76px");
        }

        return () => {
            setPositionBottom("");
            setPositionTop("");
        };
    }, [show]);

    const handleSelect = (emoji: string) => {
        toggleReaction(messageId, emoji, reactions);
        handleClose();
    };

    const styleModifier: any = {};

    !isUsersMessage && !isMobile && !indentReactionPopover
        ? (styleModifier.left = "-80px")
        : !isUsersMessage && !isMobile && indentReactionPopover
        ? (styleModifier.left = "-180px")
        : !isUsersMessage && isMobile
        ? (styleModifier.left = "0px")
        : null;
    isUsersMessage && !isMobile && !indentReactionPopover
        ? (styleModifier.right = "-80px")
        : isUsersMessage && !isMobile && indentReactionPopover
        ? (styleModifier.right = "-180px")
        : isUsersMessage && isMobile
        ? (styleModifier.right = "0px")
        : null;

    if (!show) return <></>;

    return (
        <>
            {show ? (
                <Box
                    sx={{
                        visibility: positionBottom || positionTop ? "visible" : "hidden",
                        position: "absolute",
                        bottom: positionBottom,
                        top: positionTop,
                        padding: "20px 12px",
                        ...styleModifier,
                    }}
                    ref={reactionMenuRef}
                >
                    <Box
                        sx={{
                            backgroundColor: isDarkTheme ? "background.paper" : "#fff",
                            borderRadius: "5px",
                            boxShadow: "0px 0px 5px 0px rgba(0,0,0,0.1)",
                            zIndex: 1100,
                        }}
                    >
                        <Box display="flex" gap="10px" alignItems="center" padding="2px">
                            {reactionEmojis.map((emoji, i) => {
                                return (
                                    <Typography
                                        key={i}
                                        onClick={() => handleSelect(emoji)}
                                        sx={{
                                            fontSize: "22px",
                                            width: "36px",
                                            textAlign: "center",
                                            "&:hover": {
                                                cursor: "pointer",
                                                backgroundColor: "rgba(201, 201, 202, 0.5);",
                                                borderRadius: "4px",
                                            },
                                        }}
                                    >
                                        {emoji}
                                    </Typography>
                                );
                            })}

                            <AddIcon
                                sx={{
                                    fill: isDarkTheme ? "#0078FF" : "#9AA0A6",
                                    fontSize: "34px",
                                    "&:hover": {
                                        cursor: "pointer",
                                        backgroundColor: "rgba(201, 201, 202, 0.5);",
                                        borderRadius: "4px",
                                        height: "100%",
                                    },
                                }}
                                onClick={() => {
                                    dispatch(showCustomEmojiModal({ roomId, messageId }));
                                    setShowReactionMenu(false);
                                    setMouseOver(false);
                                }}
                            />
                        </Box>
                    </Box>
                </Box>
            ) : null}
        </>
    );
}
