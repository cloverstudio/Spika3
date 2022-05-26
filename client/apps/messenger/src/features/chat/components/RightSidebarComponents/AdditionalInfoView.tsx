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
                    padding: "10px",
                    paddingTop: "15px",
                }}
            >
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                        height: "40px",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "100%",
                    }}
                >
                    <Box component="span">Shared Media, Links and Docs</Box>
                    <ChevronRight />
                </Stack>

                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                        height: "40px",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "100%",
                    }}
                >
                    <Box component="span">Call history</Box>
                    <ChevronRight />
                </Stack>
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                        height: "40px",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "100%",
                    }}
                >
                    <Box component="span">Notes</Box>
                    <ChevronRight />
                </Stack>
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                        height: "40px",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "100%",
                    }}
                >
                    <Box component="span">Favorite messages</Box>
                    <ChevronRight />
                </Stack>
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                        height: "40px",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "100%",
                    }}
                    onClick={(e) => {
                        handleSelection("favoriteMessages");
                    }}
                >
                    <Box component="span">Pin chat</Box>
                    <Switch />
                </Stack>
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                        height: "40px",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "100%",
                    }}
                >
                    <Box component="span">Mute notifications</Box>
                    <Switch />
                </Stack>
            </Stack>
        </Box>
    );
}
