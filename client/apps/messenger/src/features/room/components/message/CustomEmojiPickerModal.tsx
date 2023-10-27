import { Box, Dialog, useMediaQuery, useTheme } from "@mui/material";
import EmojiPicker, { EmojiClickData, EmojiStyle, SuggestionMode } from "emoji-picker-react";
import React from "react";
import { useParams } from "react-router-dom";
import useReactions from "../../../../hooks/useReactions";
import { useAppDispatch, useAppSelector } from "../../../../hooks";
import {
    hideCustomEmojiModal,
    selectActiveMessage,
    selectMessageReactions,
    selectShowCustomEmojiModal,
} from "../../slices/messages";
import "../../../../style/emojiPicker.scss";

export default function CustomEmojiPickerModal() {
    const roomId = parseInt(useParams().id || "");
    const activeMessage = useAppSelector(selectActiveMessage(roomId));

    const isModalOpen = useAppSelector(selectShowCustomEmojiModal(roomId, activeMessage?.id));

    const reactions = useAppSelector(selectMessageReactions(roomId, activeMessage?.id));

    const dispatch = useAppDispatch();

    const { toggleReaction } = useReactions();

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const handleEmojiClick = async (reaction: string) => {
        toggleReaction(activeMessage.id, reaction, reactions);
        dispatch(hideCustomEmojiModal(roomId));
    };

    const onClose = () => {
        dispatch(hideCustomEmojiModal(roomId));
    };

    return (
        <Dialog
            open={isModalOpen}
            onKeyDown={(e) => {
                if (e.key === "Escape") onClose();
            }}
            onClose={onClose}
        >
            <Box
                sx={{
                    fontSize: "12px",
                }}
            >
                <EmojiPicker
                    previewConfig={{ showPreview: false }}
                    height={isMobile ? "400px" : "500px"}
                    width={isMobile ? "270px" : "600px"}
                    emojiStyle={EmojiStyle.NATIVE}
                    onEmojiClick={(emojiData: EmojiClickData) => {
                        handleEmojiClick(emojiData.emoji);
                    }}
                    suggestedEmojisMode={SuggestionMode.RECENT}
                />
            </Box>
        </Dialog>
    );
}
