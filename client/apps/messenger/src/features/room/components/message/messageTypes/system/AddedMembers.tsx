import React from "react";
import { Box, Typography } from "@mui/material";

export default function AddedMembersSystemMessage({
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
                added{" "}
                <Box component="span" fontWeight="bold">
                    {body.object.join(", ")}
                </Box>{" "}
                to the group
            </Typography>
        </Box>
    );
}
