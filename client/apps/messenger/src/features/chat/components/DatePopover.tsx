import React from "react";
import { Popover, Typography } from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";

type DatePopoverProps = {
    createdAt: number;
    isUsersMessage: boolean;
    handleClose: () => void;
    mouseOver: boolean;
};

export default function DatePopover({
    createdAt,
    isUsersMessage,
    handleClose,
    mouseOver,
}: DatePopoverProps): React.ReactElement {
    const styleModifier: any = {
        opacity: 0,
    };
    if (!isUsersMessage) styleModifier.right = "-50px";
    else styleModifier.left = "-50px";

    if (mouseOver) styleModifier.opacity = 1;

    return (
        <Box
            sx={{
                ...{
                    transition: "opacity 0.2s ease",
                    minWidth: "100px",
                    backgroundColor: "#0009",
                    display: "inline-block",
                    borderRadius: "5px",
                    padding: "1px",
                    position: "absolute",
                    top: "-20px",
                },
                ...styleModifier,
            }}
        >
            <Typography
                sx={{
                    color: "common.white",
                    fontSize: "0.9em",
                    padding: "3px",
                }}
            >
                {dayjs(createdAt).format("ddd HH:mm")}
            </Typography>
        </Box>
    );
}
