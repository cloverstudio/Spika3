import React from "react";
import { Box, Typography } from "@mui/material";

export default function CreatedNoteSystemMessage({
    body,
    createdAt,
}: {
    body: {
        text: string;
        type: string;
        subject: string;
        objects: string[];
    };
    createdAt: number;
}): React.ReactElement {
    const time = new Date(createdAt).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: false,
    });
    return (
        <Box textAlign="center" py={0.5}>
            <Typography variant="body1" color="textSecondary">
                <Box component="span" fontStyle="italic">
                    {time}
                </Box>{" "}
                <Box component="span" fontWeight="bold">
                    {body.subject}
                </Box>{" "}
                created note{" "}
                <Box component="span" fontWeight="bold">
                    {body.objects?.join(", ")}
                </Box>
            </Typography>
        </Box>
    );
}