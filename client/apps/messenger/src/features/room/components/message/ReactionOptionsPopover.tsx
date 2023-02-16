import React from "react";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { Box } from "@mui/material";

import { reactionEmojis } from "../../lib/consts";
import { useCreateReactionMutation } from "../../api/message";

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

    if (!isUsersMessage) styleModifier.left = "35px";
    else styleModifier.right = "50px";

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
                            bottom: "-40px",
                            zIndex: 1100,
                        },
                        ...styleModifier,
                    }}
                >
                    <Stack direction="row">
                        {reactionEmojis.map((emoji, i) => (
                            <Button
                                key={i}
                                onClick={() => handleSelect(emoji)}
                                sx={{ p: 0, fontSize: "1.5rem" }}
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
