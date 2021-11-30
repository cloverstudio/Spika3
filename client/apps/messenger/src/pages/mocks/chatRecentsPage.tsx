import React from "react";
import {
    List,
    Box,
    Stack,
    ListItem,
    ListItemAvatar,
    TextField,
    ListItemText,
    Avatar,
    Typography,
    ListItemSecondaryAction,
} from "@mui/material";
import logo from "../../../../../../documents/pages/login_logo.svg";
import { createTheme, ThemeProvider, styled } from "@mui/material/styles";
import { height, textAlign } from "@mui/system";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import PublicIcon from "@mui/icons-material/Public";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import AddBoxIcon from "@mui/icons-material/AddBox";
import { relative } from "path/posix";
import FolderIcon from "@mui/icons-material/Folder";

const theme = createTheme({
    palette: {
        mode: "light",
    },
});

function generate(element: React.ReactElement) {
    return [0, 1, 2].map((value) =>
        React.cloneElement(element, {
            key: value,
        })
    );
}

const ChatRecentsPage = () => {
    const [dense, setDense] = React.useState(false);

    return (
        <ThemeProvider theme={theme}>
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
                width="100%"
                className="logo-chat-title"
            >
                <img className="logo-chat" src={logo} />
                <label className="logo-chat"> Spika </label>
                <IconButton>
                    <AccountCircleRoundedIcon />
                </IconButton>
            </Stack>
            <Box className="search-box">
                <SearchIcon sx={{ color: "action.active", mr: 1, my: 0.5 }} />
                <TextField
                    label="Search for contact, message, file ..."
                    sx={{ width: "100%", fontSize: 12 }}
                    inputProps={{ style: { fontSize: 12 } }}
                    InputLabelProps={{ style: { fontSize: 12 } }}
                />
            </Box>
            <Box className="recents-list">
                <Stack
                    alignItems="center"
                    spacing={1}
                    direction="row"
                    className="chat-control"
                    sx={{ borderRadius: 1 }}
                >
                    <IconButton>
                        <PublicIcon />
                    </IconButton>
                    <IconButton>
                        <PersonOutlineOutlinedIcon />
                    </IconButton>
                    <IconButton>
                        <PeopleOutlineOutlinedIcon />
                    </IconButton>
                    <IconButton className="chat-new">
                        <Stack
                            alignItems="center"
                            spacing={1}
                            direction="row"
                            className="chat-new"
                            sx={{ borderRadius: 1, padding: 1 }}
                        >
                            <label style={{ fontSize: 14, color: "white" }}> NEW </label>
                            <AddBoxIcon style={{ fill: "white" }} />
                        </Stack>
                    </IconButton>
                </Stack>
                <List dense={dense}>
                    {generate(
                        <ListItem>
                            <ListItemSecondaryAction className="secondary-action">
                                <Typography className="timestamp">10:30</Typography>
                            </ListItemSecondaryAction>
                            <ListItemAvatar>
                                <Avatar>
                                    <FolderIcon />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary="Matej Vida" secondary="Kaze da moze sada" />
                        </ListItem>
                    )}
                </List>
            </Box>
        </ThemeProvider>
    );
};

export default ChatRecentsPage;
