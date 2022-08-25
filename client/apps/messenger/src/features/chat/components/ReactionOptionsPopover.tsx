import React from "react";
import { Button, Popover, Stack } from "@mui/material";

import { reactionEmojis } from "../lib/consts";
import { useCreateReactionMutation } from "../api/message";
import { Box } from "@mui/system";

type ReactionOptionsPopoverProps = {
    isUsersMessage: boolean;
    messageId: number;
    handleClose: () => void;
    show: boolean;
};

export default function ReactionOptionsPopover({
    isUsersMessage,
    messageId,
    handleClose,
    show,
}: ReactionOptionsPopoverProps): React.ReactElement {
    const [createReaction] = useCreateReactionMutation();

    const handleSelect = async (reaction: string) => {
        await createReaction({ reaction, messageId });
        handleClose();
    };

    const styleModifier: any = {};

    const itemStyle = {
        cursor: "pointer",
        color: "#222",
        "&:hover": {
            opacity: "0.5",
        },
    };

    if (!isUsersMessage) styleModifier.left = "35px";
    else styleModifier.right = "50px";

    if(!show) return <></>;

    return (
        <>
            {show ? (
                <Box
                    onMouseLeave={() => {
                        handleClose();
                    }}
                    sx={{
                        ...{
                            backgroundColor: "#fff",
                            border: "2px solid #9995",
                            borderRadius: "5px",
                            position: "absolute",
                            bottom: "-40px",
                            zIndex: 1100,
                        },
                        ...styleModifier,
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
                </Box>
            ) : null}
        </>
    );
}
