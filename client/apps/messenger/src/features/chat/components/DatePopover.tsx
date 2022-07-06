import React from "react";
import { Popover, Typography } from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";

type DatePopoverProps = {
    createdAt: number;
    isUsersMessage: boolean;
    handleClose: () => void;
    anchorEl: any;
};

export default function DatePopover({
    createdAt,
    isUsersMessage,
    handleClose,
    anchorEl,
}: DatePopoverProps): React.ReactElement {
    const open = Boolean(anchorEl);

    return (
        <Box>
            <Popover
                id="mouse-over-popover"
                open={open}
                anchorEl={anchorEl}
                sx={{
                    pointerEvents: "none",
                }}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: isUsersMessage ? "right" : "left",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                }}
                onClose={handleClose}
                disableRestoreFocus
            >
                <Typography p={1}>{dayjs(createdAt).format("ddd HH:mm")}</Typography>
            </Popover>
        </Box>
    );
}
