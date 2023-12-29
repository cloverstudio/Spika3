import React from "react";
import { Box, Typography } from "@mui/material";

export default function UpdateGroupNameSystemMessage({
    body,
}: {
    body: {
        text: string;
        type: string;
        subject: string;
        object: string;
    };
}): React.ReactElement {
    return (
        <Box textAlign="center" py={0.5}>
            <Typography variant="body1" color="textSecondary">
                <Box component="span" fontWeight="bold">
                    {body.subject}
                </Box>{" "}
                has changed the group name
            </Typography>
        </Box>
    );
}
