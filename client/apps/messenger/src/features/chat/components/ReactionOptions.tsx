import React from "react";
import { Button, Paper, Stack } from "@mui/material";

import { reactionEmojis } from "../lib/consts";
import { useCreateReactionMutation } from "../api/message";

type ReactionOptionsProps = {
    onClose: () => void;
    messageId: number;
};

export default function ReactionOptions({
    onClose,
    messageId,
}: ReactionOptionsProps): React.ReactElement {
    const [createReaction] = useCreateReactionMutation();

    const handleSelect = async (reaction: string) => {
        await createReaction({ reaction, messageId });
        onClose();
    };

    return (
        <Paper
            elevation={10}
            sx={{
                position: "absolute",
                ml: "26px",
                zIndex: "99",
                p: 1,
            }}
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
        </Paper>
    );
}
