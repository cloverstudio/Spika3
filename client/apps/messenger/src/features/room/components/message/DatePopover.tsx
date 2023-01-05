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
    if (!isUsersMessage) styleModifier.left = "0";
    else styleModifier.right = "18px";

    if (mouseOver) styleModifier.opacity = 1;

    if (!mouseOver) return <></>;

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
                    bottom: "-20px",
                    zIndex: 1000,
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
