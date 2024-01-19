import React from "react";
import { Box, Typography } from "@mui/material";

export default function RemovedAdminsSystemMessage({
    body,
    createdAt,
}: {
    body: {
        text: string;
        type: string;
        subject: string;
        object: string[];
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
                removed{" "}
                <Box component="span" fontWeight="bold">
                    {body.object.join(", ")}
                </Box>{" "}
                from group admins
            </Typography>
        </Box>
    );
}
