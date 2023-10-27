import React from "react";

import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";

import { reactionEmojis } from "../../lib/consts";
import { selectMessageReactions, showCustomEmojiModal } from "../../slices/messages";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import AddIcon from "@mui/icons-material/Add";
import { useAppDispatch } from "../../../../hooks";
import useReactions from "../../../../hooks/useReactions";

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

    const reactions = useSelector(selectMessageReactions(roomId, messageId));

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const handleSelect = (emoji: string) => {
        toggleReaction(messageId, emoji, reactions);
        handleClose();
    };

    const styleModifier: any = {};

    !isUsersMessage && !isMobile
        ? (styleModifier.left = "-66px")
        : !isUsersMessage && isMobile
        ? (styleModifier.left = "0px")
        : null;
    isUsersMessage && !isMobile
        ? (styleModifier.right = "-66px")
        : isUsersMessage && isMobile
        ? (styleModifier.right = "0px")
        : null;

    if (!show) return <></>;

    return (
        <>
            {show ? (
                <Box
                    sx={{
                        ...{
                            backgroundColor: "#fff",
                            border: "2px solid #9995",
                            borderRadius: "5px",
                            position: "absolute",
                            bottom: "-44px",
                            zIndex: 1100,
                        },
                        ...styleModifier,
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
                                            backgroundColor: "text.tertiary",
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
                                fill: "blue",
                                fontSize: "32px",
                                "&:hover": {
                                    cursor: "pointer",
                                    backgroundColor: "text.tertiary",
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
            ) : null}
        </>
    );
}
