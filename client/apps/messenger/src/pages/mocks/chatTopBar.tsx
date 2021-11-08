import React from "react";
import { createTheme, ThemeProvider, styled } from "@mui/material/styles";
import {
    Grid,
    Box,
    Stack,
    Paper,
    Container,
    TextField,
    Button,
    Link,
    Divider,
} from "@mui/material";
import { blue, green, red } from "@mui/material/colors";
import IconButton from "@mui/material/IconButton";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import ImageIcon from "@mui/icons-material/Image";
import MovieCreationIcon from "@mui/icons-material/MovieCreation";
import HeadphonesIcon from "@mui/icons-material/Headphones";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import LinkIcon from "@mui/icons-material/Link";
import FindInPageIcon from "@mui/icons-material/FindInPage";

const theme = createTheme({
    palette: {
        mode: "light",
    },
});

const ChatTopBar = () => {
    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ flexGrow: 1 }}>
                <Stack alignItems="center" spacing={5} direction="row">
                    <Box>
                        <Stack alignItems="center" spacing={1} direction="row">
                            <IconButton>
                                <Stack alignItems="center" spacing={1} direction="row">
                                    <AccountCircleRoundedIcon style={{ width: 20, height: 20 }} />
                                    <label style={{ fontSize: 12 }}> 16 </label>
                                </Stack>
                            </IconButton>
                        </Stack>
                    </Box>
                    <Box>
                        <Stack alignItems="center" spacing={1} direction="row">
                            <label style={{ fontSize: 12, color: "grey" }}> Media: </label>
                            <IconButton>
                                <Stack alignItems="center" spacing={1} direction="row">
                                    <ImageIcon style={{ width: 20, height: 20 }} />
                                    <label style={{ fontSize: 12 }}> 16 </label>
                                </Stack>
                            </IconButton>
                            <IconButton>
                                <Stack alignItems="center" spacing={1} direction="row">
                                    <MovieCreationIcon style={{ width: 20, height: 20 }} />
                                    <label style={{ fontSize: 12 }}> 16 </label>
                                </Stack>
                            </IconButton>
                            <IconButton>
                                <Stack alignItems="center" spacing={1} direction="row">
                                    <HeadphonesIcon style={{ width: 20, height: 20 }} />
                                    <label style={{ fontSize: 12 }}> 16 </label>
                                </Stack>
                            </IconButton>
                        </Stack>
                    </Box>
                    <Box>
                        <Stack alignItems="center" spacing={1} direction="row">
                            <label style={{ fontSize: 12, color: "grey" }}> File: </label>
                            <IconButton>
                                <Stack alignItems="center" spacing={1} direction="row">
                                    <PictureAsPdfIcon style={{ width: 20, height: 20 }} />
                                    <label style={{ fontSize: 12 }}> 16 </label>
                                </Stack>
                            </IconButton>
                            <IconButton>
                                <Stack alignItems="center" spacing={1} direction="row">
                                    <DescriptionIcon style={{ width: 20, height: 20 }} />
                                    <label style={{ fontSize: 12 }}> 16 </label>
                                </Stack>
                            </IconButton>
                            <IconButton>
                                <Stack alignItems="center" spacing={1} direction="row">
                                    <InsertDriveFileIcon style={{ width: 20, height: 20 }} />
                                    <label style={{ fontSize: 12 }}> 16 </label>
                                </Stack>
                            </IconButton>
                        </Stack>
                    </Box>
                    <Box>
                        <Stack alignItems="center" spacing={1} direction="row">
                            <label style={{ fontSize: 12, color: "grey" }}> Links: </label>
                            <IconButton>
                                <Stack alignItems="center" spacing={1} direction="row">
                                    <LinkIcon style={{ width: 20, height: 20 }} />
                                    <label style={{ fontSize: 12 }}> 16 </label>
                                </Stack>
                            </IconButton>
                            <IconButton>
                                <Stack alignItems="center" spacing={1} direction="row">
                                    <FindInPageIcon style={{ width: 20, height: 20 }} />
                                    <label style={{ fontSize: 12 }}> 16 </label>
                                </Stack>
                            </IconButton>
                        </Stack>
                    </Box>
                </Stack>
            </Box>
        </ThemeProvider>
    );
};

export default ChatTopBar;
