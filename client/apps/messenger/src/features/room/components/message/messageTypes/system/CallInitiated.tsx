import React from "react";
import { Box, Typography, Stack, IconButton } from "@mui/material";
import { Call, Videocam } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectUser } from "../../../../../../store/userSlice";
import { useAppDispatch } from "../../../../../../hooks";
import { openCallIframe } from "../../../../slices/callIframe";
import { useAcceptCallMutation } from "../../../../api/room";

declare const EDUMEET_URL: string;

export default function CallInitiated({
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
        isOngoing?: boolean;
    };
    createdAt: number;
}): React.ReactElement {
    const time = new Date(createdAt).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: false,
    });

    const me = useSelector(selectUser);

    const dispatch = useAppDispatch();

    const [acceptCall] = useAcceptCallMutation();

    const handleJoinCall = async (enableCamera: boolean) => {
        try {
            await acceptCall({ roomId: body.roomId }).unwrap();
            dispatch(
                openCallIframe({
                    url: `${EDUMEET_URL}/${body.roomId}?displayName=${me.displayName}&headless=true&video=${enableCamera}`,
                }),
            );
        } catch (e) {
            console.error(e);
        }
    };

    const iconSxProps = {
        width: "25px",
        height: "25px",
        color: "primary.main",
        cursor: "pointer",
        "&:hover": {
            backgroundColor: "transparent",
        },
    };

    return (
        <Stack direction="row" justifyContent="center" alignItems="center" gap="8px" py={0.5}>
            <Typography variant="body1" color="textSecondary">
                <Box component="span" fontStyle="italic">
                    {time}
                </Box>{" "}
                <Box component="span" fontWeight="bold">
                    {body.user}
                </Box>{" "}
                initiated call
            </Typography>
            {body.isOngoing && (
                <Stack direction="row" justifyContent="center" gap="8px">
                    <IconButton sx={iconSxProps} onClick={() => handleJoinCall(false)}>
                        <Call />
                    </IconButton>
                    <IconButton sx={iconSxProps} onClick={() => handleJoinCall(true)}>
                        <Videocam />
                    </IconButton>
                </Stack>
            )}
        </Stack>
    );
}
