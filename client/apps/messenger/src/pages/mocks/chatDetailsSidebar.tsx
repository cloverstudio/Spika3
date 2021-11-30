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

const theme = createTheme({
    palette: {
        mode: "light",
    },
});

const lightClasses = `button-component light-blue-button `;
const darkClasses = `button-component dark-blue-button `;

const ChatDetailsSidebar = () => {
    return (
        <ThemeProvider theme={theme}>
            <Box className="top-details-box">
                <Box className="inner-box">
                    <Avatar
                        className="chat-avata"
                        alt="Remy Sharp"
                        src="../../../../../../documents/pages/login_robot_image.svg"
                    />
                    <label className="chat-title">Group work and stuff</label>
                    <Box className="color-box">
                        <Stack alignItems="center" spacing={1} direction="row">
                            <IconButton>
                                <CircleTwoToneIcon className="red-type" />
                            </IconButton>
                            <IconButton>
                                <CircleTwoToneIcon className="green-type" />
                            </IconButton>
                            <IconButton>
                                <CircleTwoToneIcon className="yellow-type" />
                            </IconButton>
                            <IconButton>
                                <CircleTwoToneIcon className="blue-type" />
                            </IconButton>
                        </Stack>
                    </Box>
                    <Box className="button-box">
                        <Stack alignItems="center" direction="row">
                            <IconButton className="no-padding">
                                <Box className={lightClasses}>
                                    <CallOutlinedIcon className="white-type" />
                                    <label className="button-text">Audio</label>
                                </Box>
                            </IconButton>
                            <IconButton className="no-padding">
                                <Box className={lightClasses}>
                                    <VideocamOutlinedIcon className="white-type" />
                                    <label className="button-text">Video</label>
                                </Box>
                            </IconButton>
                            <IconButton className="no-padding">
                                <Box className={darkClasses}>
                                    <VolumeOffOutlinedIcon className="white-type" />
                                    <label className="button-text">Mute</label>
                                </Box>
                            </IconButton>
                            <IconButton className="no-padding">
                                <Box className={darkClasses}>
                                    <MoreHorizOutlinedIcon className="white-type" />
                                    <label className="button-text">More</label>
                                </Box>
                            </IconButton>
                        </Stack>
                    </Box>
                    <Box>
                        <Box>
                            <label className="side-title">Call history</label>
                        </Box>
                        <Box>
                            <label className="side-empty-title">No call history yet...</label>
                        </Box>
                    </Box>
                    <Box>
                        <Box>
                            <Stack
                                alignItems="center"
                                spacing={1}
                                direction="row"
                                className="chat-control"
                                sx={{ borderRadius: 1 }}
                            >
                                <label className="side-title">Notes</label>
                                <IconButton style={{ textAlign: "right" }}>
                                    <Stack
                                        alignItems="center"
                                        spacing={1}
                                        direction="row"
                                        className="chat-new"
                                        sx={{ borderRadius: 1, padding: 1 }}
                                    >
                                        <AddIcon style={{ fill: "white" }} />
                                        <label style={{ fontSize: 14, color: "white" }}>
                                            {" "}
                                            Add new{" "}
                                        </label>
                                    </Stack>
                                </IconButton>
                            </Stack>
                        </Box>
                        <Box>
                            <label className="side-empty-title">There are no notes so far...</label>
                        </Box>
                    </Box>
                    <Box>
                        <Box>
                            <label className="side-title">Favorites</label>
                        </Box>
                        <Box>
                            <label className="side-empty-title">
                                You haven’t favorited any message so far....
                            </label>
                        </Box>
                    </Box>
                    <Box>
                        <Box>
                            <label className="side-title">Shared media</label>
                        </Box>
                        <Box>
                            <label className="side-empty-title">
                                There is no media shared so far...
                            </label>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default ChatDetailsSidebar;
