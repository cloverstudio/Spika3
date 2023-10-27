import { Box } from "@mui/material";
import React, { useEffect, useRef } from "react";
import { useAppDispatch } from "../../../../hooks";
import { hideCustomEmojiModal } from "../../slices/messages";
import EmojiPicker, { EmojiClickData, EmojiStyle, SuggestionMode } from "emoji-picker-react";
import "../../../../style/emojiPicker.scss";

interface Props {
    roomId: number;
    onEmojiClick: (emoji: string) => void;
}

export function CustomEmojiContainer({ roomId, onEmojiClick }: Props) {
    const dispatch = useAppDispatch();

    const customEmojiDiv = useRef(null);

    useEffect(() => {
        const isClickedOutside = (e) => {
            if (customEmojiDiv.current && !customEmojiDiv.current.contains(e.target)) {
                dispatch(hideCustomEmojiModal(roomId));
            }
        };

        document.addEventListener("mousedown", isClickedOutside);

        return () => {
            document.removeEventListener("mousedown", isClickedOutside);
        };
    }, []);

    return (
        <Box
            sx={{
                fontSize: "12px",
            }}
            ref={customEmojiDiv}
        >
            <EmojiPicker
                previewConfig={{ showPreview: false }}
                height="400px"
                width="350px"
                emojiStyle={EmojiStyle.NATIVE}
                onEmojiClick={(emojiData: EmojiClickData, event: MouseEvent) => {
                    onEmojiClick(emojiData.emoji);
                }}
                suggestedEmojisMode={SuggestionMode.RECENT}
            />
        </Box>
    );
}
