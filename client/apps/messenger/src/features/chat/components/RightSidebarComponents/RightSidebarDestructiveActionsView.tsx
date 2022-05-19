import React from "react";
import { Box, Stack, IconButton, Typography } from "@mui/material";
import { ExitToApp, WarningAmber, DoDisturb } from "@mui/icons-material";

import { RoomUserType } from "../../../../types/Rooms";

export interface DetailsDestructiveActionsProps {
    isItPrivateChat: boolean;
    otherUser: RoomUserType;
}

export function DetailsDestructiveActionsView(props: DetailsDestructiveActionsProps) {
    const { isItPrivateChat, otherUser } = props;

    return (
        <Box>
            {isItPrivateChat ? (
                <IconButton
                    disableRipple
                    size="large"
                    sx={{
                        ml: 1,
                        "&.MuiButtonBase-root:hover": {
                            bgcolor: "transparent",
                        },
                        width: "100%",
                    }}
                >
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "flex-start",
                            width: "100%",
                        }}
                    >
                        <DoDisturb style={{ fill: "red" }} />
                        <Typography variant="subtitle1" color="red">
                            Block {otherUser.user.displayName}
                        </Typography>
                    </Stack>
                </IconButton>
            ) : null}
            <IconButton
                disableRipple
                size="large"
                sx={{
                    ml: 1,
                    "&.MuiButtonBase-root:hover": {
                        bgcolor: "transparent",
                    },
                    width: "100%",
                }}
            >
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "flex-start",
                        width: "100%",
                    }}
                >
                    <WarningAmber style={{ fill: "red" }} />
                    {isItPrivateChat ? (
                        <Typography variant="subtitle1" color="red">
                            Report {otherUser.user.displayName}
                        </Typography>
                    ) : (
                        <Typography variant="subtitle1" color="red">
                            Report group
                        </Typography>
                    )}
                </Stack>
            </IconButton>
            <IconButton
                disableRipple
                size="large"
                sx={{
                    ml: 1,
                    "&.MuiButtonBase-root:hover": {
                        bgcolor: "transparent",
                    },
                    width: "100%",
                }}
            >
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "flex-start",
                        width: "100%",
                    }}
                >
                    <ExitToApp style={{ fill: "red" }} />
                    {isItPrivateChat ? (
                        <Typography variant="subtitle1" color="red">
                            Leave conversation
                        </Typography>
                    ) : (
                        <Typography variant="subtitle1" color="red">
                            Exit group
                        </Typography>
                    )}
                </Stack>
            </IconButton>
        </Box>
    );
}
