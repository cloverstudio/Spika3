import React, { useState } from "react";
import { Box, Stack, IconButton, Typography, Avatar, Switch } from "@mui/material";
import { Close, ChevronRight, Add, ExitToApp, WarningAmber } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { hide as hideRightSidebar } from "./slice/rightSidebarSlice";

type DetailSidebarProps = {
    name: string;
    avatarUrl: string;
};

export default function RightSidebar(): React.ReactElement {
    const dispatch = useDispatch();

    return (
        <Box borderLeft="0.5px solid #C9C9CA" padding="0" margin="0">
            <Box height="80.5px" borderBottom="0.5px solid #C9C9CA">
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "left",
                        paddingTop: "15px",
                    }}
                >
                    <IconButton
                        size="large"
                        onClick={(e) => {
                            dispatch(hideRightSidebar());
                        }}
                    >
                        <Close />
                    </IconButton>
                    <Typography variant="h6">Group details</Typography>
                </Stack>
            </Box>
            <Box>
                <Stack
                    direction="column"
                    alignItems="center"
                    spacing={1}
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        paddingTop: "15px",
                    }}
                >
                    <Avatar /*alt={name} src={avatarUrl}*/ />
                    <Typography variant="h6">Name</Typography>
                </Stack>
            </Box>
            <Box>
                <Stack
                    direction="column"
                    alignItems="center"
                    spacing={1}
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        paddingTop: "15px",
                    }}
                >
                    <IconButton
                        disableRipple
                        size="large"
                        sx={{
                            ml: 1,
                            "&.MuiButtonBase-root:hover": {
                                bgcolor: "transparent",
                            },
                            width: "100%",
                            margin: "0",
                        }}
                    >
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-between",
                                width: "100%",
                            }}
                        >
                            <Typography variant="subtitle1">
                                Shared Media, Links and Docs
                            </Typography>
                            <ChevronRight />
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
                                justifyContent: "space-between",
                                width: "100%",
                            }}
                        >
                            <Typography variant="subtitle1">Call history</Typography>
                            <ChevronRight />
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
                                justifyContent: "space-between",
                                width: "100%",
                            }}
                        >
                            <Typography variant="subtitle1">Notes</Typography>
                            <ChevronRight />
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
                                justifyContent: "space-between",
                                width: "100%",
                            }}
                        >
                            <Typography variant="subtitle1">Favorite messages</Typography>
                            <ChevronRight />
                        </Stack>
                    </IconButton>
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            width: "100%",
                            padding: "12px",
                        }}
                    >
                        <Typography variant="subtitle1">Pin chat</Typography>
                        <Switch />
                    </Stack>
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            width: "100%",
                            padding: "12px",
                        }}
                    >
                        <Typography variant="subtitle1">Mute notifications</Typography>
                        <Switch />
                    </Stack>
                </Stack>
            </Box>
            <Box padding="12px">
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "100%",
                    }}
                >
                    <Typography variant="h6"> 12 Members</Typography>
                    <IconButton size="large" color="primary">
                        <Add />
                    </IconButton>
                </Stack>
                <IconButton
                    disableRipple
                    size="large"
                    color="primary"
                    sx={{
                        ml: 1,
                        "&.MuiButtonBase-root:hover": {
                            bgcolor: "transparent",
                        },
                        width: "100%",
                        margin: "0",
                        padding: "0",
                    }}
                >
                    <Typography variant="subtitle1">Show more</Typography>
                </IconButton>
            </Box>
            <Box>
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
                        <Typography variant="subtitle1" color="red">
                            Exit group
                        </Typography>
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
                        <WarningAmber style={{ fill: "red" }} />
                        <Typography variant="subtitle1" color="red">
                            Report group
                        </Typography>
                    </Stack>
                </IconButton>
            </Box>
        </Box>
    );
}
