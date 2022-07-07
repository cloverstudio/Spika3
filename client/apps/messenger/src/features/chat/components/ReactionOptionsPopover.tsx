import React from "react";
import { Button, Popover, Stack } from "@mui/material";

import { reactionEmojis } from "../lib/consts";
import { useCreateReactionMutation } from "../api/message";
import { Box } from "@mui/system";

type ReactionOptionsPopoverProps = {
    messageId: number;
    handleClose: () => void;
    anchorEl: any;
};

export default function ReactionOptionsPopover({
    messageId,
    handleClose,
    anchorEl,
}: ReactionOptionsPopoverProps): React.ReactElement {
    const [createReaction] = useCreateReactionMutation();

    const handleSelect = async (reaction: string) => {
        await createReaction({ reaction, messageId });
        handleClose();
    };

    const open = Boolean(anchorEl);

    return (
        <Box>
            <Popover
                id="mouse-over-popover"
                open={open}
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                }}
                onClose={handleClose}
                disableRestoreFocus
            >
                <Stack direction="row" spacing={1}>
                    {reactionEmojis.map((emoji, i) => (
                        <Button
                            key={i}
                            onClick={() => handleSelect(emoji)}
                            sx={{ p: 0, fontSize: "2rem" }}
                        >
                            {emoji}
                        </Button>
                    ))}
                </Stack>
            </Popover>
        </Box>
    );
}
