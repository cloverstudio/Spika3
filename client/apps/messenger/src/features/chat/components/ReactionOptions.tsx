import React, { useEffect, useRef } from "react";
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
    const ref = useRef<HTMLDivElement>();

    const handleSelect = async (reaction: string) => {
        await createReaction({ reaction, messageId });
        onClose();
    };

    useEffect(() => {
        if (ref?.current) {
            const observer = new IntersectionObserver((entries) => {
                const isInViewPortNew = !!entries[0]?.isIntersecting;
                if (!isInViewPortNew) {
                    ref.current.scrollIntoView({ behavior: "smooth" });
                }
            });

            observer.observe(ref.current);

            return () => observer.disconnect();
        }
    }, []);

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
            <Stack direction="row" spacing={1} ref={ref}>
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
