import React from "react";
import { Box, Typography } from "@mui/material";

export default function RemovedMembersSystemMessage({
    body,
}: {
    body: {
        text: string;
        type: string;
        subject: string;
        object: string[];
    };
}): React.ReactElement {
    return (
        <Box textAlign="center" py={0.5}>
            <Typography variant="body1" color="textSecondary">
                <Box component="span" fontWeight="bold">
                    {body.subject}
                </Box>{" "}
                removed{" "}
                <Box component="span" fontWeight="bold">
                    {body.object.join(", ")}
                </Box>{" "}
                from group
            </Typography>
        </Box>
    );
}
