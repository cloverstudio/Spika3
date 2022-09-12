import React from "react";
import { Box, Stack, Switch } from "@mui/material";
import { ChevronRight } from "@mui/icons-material";
import { setActiveTab } from "../../slice/rightSidebarSlice";
import { useDispatch } from "react-redux";

export function DetailsAdditionalInfoView() {
    const dispatch = useDispatch();

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
                    onClick={() => dispatch(setActiveTab("notes"))}
                    sx={{
                        height: "40px",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "100%",
                        cursor: "pointer",
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
