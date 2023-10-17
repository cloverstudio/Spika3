import React from "react";
import Typography from "@mui/material/Typography";
import { Box } from "@mui/material";
import dayjs from "dayjs";

type DatePopoverProps = {
    createdAt: number;
    isUsersMessage: boolean;
    mouseOver: boolean;
};

export default function DatePopover({
    createdAt,
    isUsersMessage,
    mouseOver,
}: DatePopoverProps): React.ReactElement {
    const styleModifier: any = {
        opacity: 0,
    };

    if (mouseOver) styleModifier.opacity = 1;

    return (
        <Box
            sx={{
                ...{
                    transition: "opacity 0.2s ease",
                    minWidth: "auto",
                    display: "flex",
                    alignItems: "end",
                    justifyContent: isUsersMessage ? "end" : "start",
                    borderRadius: "5px",
                },
                ...styleModifier,
            }}
        >
            <Typography
                sx={{
                    color: "text.tertiary",
                    fontSize: "0.75em",
                    padding: "0 5px",
                    fontStyle: "italic",
                }}
            >
                {dayjs(createdAt).format("HH:mm")}
            </Typography>
        </Box>
    );
}
