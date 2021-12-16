import React from "react";
import { createTheme, ThemeProvider, styled } from "@mui/material/styles";
import {
    Avatar,
    Box,
    Stack,
    Paper,
    Container,
    Grid,
    Button,
    Link,
    Divider,
    IconButton,
} from "@mui/material";
import image from "../../../../../../documents/pages/login_robot_image.svg";
import CircleTwoToneIcon from "@mui/icons-material/CircleTwoTone";
import CallOutlinedIcon from "@mui/icons-material/CallOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import VolumeOffOutlinedIcon from "@mui/icons-material/VolumeOffOutlined";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import AddIcon from "@mui/icons-material/Add";
import { padding } from "@mui/system";

const theme = createTheme({
    palette: {
        mode: "light",
    },
});

const ChatDetailsSidebar = () => {
    return (
        <ThemeProvider theme={theme}>
            <Box margin="15px" borderRadius={10} flexGrow={1} bgcolor={"#f2f2f2"}>
                <Box margin="15px" flexGrow={1} position="relative">
                    <Avatar
                        alt="Remy Sharp"
                        src="../../../../../../documents/pages/login_robot_image.svg"
                    />
                    <Box fontSize="15px" fontWeight={500}>
                        <label>Group work and stuff</label>
                    </Box>
                    <Box margin="15px" flexGrow={1} position="relative">
                        <Stack alignItems="center" spacing={1} direction="row">
                            <IconButton>
                                <CircleTwoToneIcon style={{ color: "red" }} />
                            </IconButton>
                            <IconButton>
                                <CircleTwoToneIcon style={{ color: "green" }} />
                            </IconButton>
                            <IconButton>
                                <CircleTwoToneIcon style={{ color: "yellow" }} />
                            </IconButton>
                            <IconButton>
                                <CircleTwoToneIcon style={{ color: "blue" }} />
                            </IconButton>
                        </Stack>
                    </Box>
                    <Box margin="5px" flexGrow={1} position="relative">
                        <Stack alignItems="center" direction="row">
                            <IconButton
                                sx={{
                                    padding: 2,
                                    backgroundColor: "#4696f0",
                                    borderRadius: 1,
                                    margin: 1,
                                }}
                            >
                                <Box>
                                    <CallOutlinedIcon style={{ color: "white" }} />
                                    <Box color={"white"} fontSize="12px">
                                        <label>Audio</label>
                                    </Box>
                                </Box>
                            </IconButton>
                            <IconButton
                                sx={{
                                    padding: 2,
                                    backgroundColor: "#4696f0",
                                    borderRadius: 1,
                                    margin: 1,
                                }}
                            >
                                <Box>
                                    <VideocamOutlinedIcon style={{ color: "white" }} />
                                    <Box color={"white"} fontSize="12px">
                                        <label>Video</label>
                                    </Box>
                                </Box>
                            </IconButton>
                            <IconButton
                                sx={{
                                    padding: 2,
                                    backgroundColor: "#131940",
                                    borderRadius: 1,
                                    margin: 1,
                                }}
                            >
                                <Box>
                                    <VolumeOffOutlinedIcon style={{ color: "white" }} />
                                    <Box color={"white"} fontSize="12px">
                                        <label>Mute</label>
                                    </Box>
                                </Box>
                            </IconButton>
                            <IconButton
                                sx={{
                                    padding: 2,
                                    backgroundColor: "#131940",
                                    borderRadius: 1,
                                    margin: 1,
                                }}
                            >
                                <Box>
                                    <MoreHorizOutlinedIcon style={{ color: "white" }} />
                                    <Box color={"white"} fontSize="12px">
                                        <label>More</label>
                                    </Box>
                                </Box>
                            </IconButton>
                        </Stack>
                    </Box>
                    <Box>
                        <Box fontSize={"15px"} fontWeight={500}>
                            <label> Call history</label>
                        </Box>
                        <Box fontSize={"12px"} color={"grey"}>
                            <label>No call history yet...</label>
                        </Box>
                    </Box>
                    <Box>
                        <Box>
                            <Stack
                                alignItems="center"
                                spacing={1}
                                direction="row"
                                margin="0.5em"
                                sx={{ borderRadius: 1 }}
                            >
                                <Box fontSize={"15px"} fontWeight={500}>
                                    <label>Notes</label>
                                </Box>

                                <IconButton
                                    style={{ textAlign: "right" }}
                                    sx={{ color: "#4696f0", borderRadius: 1, padding: 1 }}
                                >
                                    <Stack alignItems="center" spacing={1} direction="row">
                                        <AddIcon style={{ fill: "white" }} />
                                        <label style={{ fontSize: 14, color: "white" }}>
                                            Add new
                                        </label>
                                    </Stack>
                                </IconButton>
                            </Stack>
                        </Box>
                        <Box fontSize={"12px"} color={"grey"}>
                            <label>There are no notes so far...</label>
                        </Box>
                    </Box>
                    <Box>
                        <Box fontSize={"15px"} fontWeight={500}>
                            <label>Favorites</label>
                        </Box>
                        <Box fontSize={"12px"} color={"grey"}>
                            <label>You haven’t favorited any message so far....</label>
                        </Box>
                    </Box>
                    <Box>
                        <Box fontSize={"15px"} fontWeight={500}>
                            <label>Shared media</label>
                        </Box>
                        <Box fontSize={"12px"} color={"grey"}>
                            <label>There is no media shared so far...</label>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default ChatDetailsSidebar;
