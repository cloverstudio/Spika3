import React from "react";
import { Box, Typography } from "@mui/material";

export default function DeletedNoteSystemMessage({
    body,
}: {
    body: {
        text: string;
        type: string;
        subject: string;
        objects: string[];
    };
}): React.ReactElement {
    return (
        <Box textAlign="center" py={0.5}>
            <Typography variant="body1" color="textSecondary">
                <Box component="span" fontWeight="bold">
                    {body.subject}
                </Box>{" "}
                deleted note{" "}
                <Box component="span" fontWeight="bold">
                    {body.objects?.join(", ")}
                </Box>
            </Typography>
        </Box>
    );
}
