import React from "react";
import { Box, Stack, IconButton, Typography, Switch } from "@mui/material";
import { ChevronRight } from "@mui/icons-material";

export interface DetailsAdditionalInfoProps {
    selectedInfo: Function;
}

export function DetailsAdditionalInfoView(props: DetailsAdditionalInfoProps) {
    const { selectedInfo } = props;

    const handleSelection = (action: String) => {
        selectedInfo(action);
    };

    return (
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
                    onClick={(e) => {
                        handleSelection("shared");
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
                        <Typography variant="subtitle1">Shared Media, Links and Docs</Typography>
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
                        paddingTop: "0",
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
                    onClick={(e) => {
                        handleSelection("callHistory");
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
                        paddingTop: "0",
                        paddingBottom: "12px",
                    }}
                    onClick={(e) => {
                        handleSelection("notes");
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
                        padding: "0px 12px",
                    }}
                    onClick={(e) => {
                        handleSelection("favoriteMessages");
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
                        padding: "0px 12px 12px 12px",
                    }}
                >
                    <Typography variant="subtitle1">Mute notifications</Typography>
                    <Switch />
                </Stack>
            </Stack>
        </Box>
    );
}
