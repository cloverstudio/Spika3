import React from "react";
import { Box, Typography } from "@mui/material";

export default function CallEnded({
    body,
    createdAt,
}: {
    body: {
        text: string;
        user: string;
        userId: number;
        type: string;
        room: string;
        roomId: number;
    };
    createdAt: number;
}) {
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
                    {body.user}
                </Box>{" "}
                ended call
            </Typography>
        </Box>
    );
}
