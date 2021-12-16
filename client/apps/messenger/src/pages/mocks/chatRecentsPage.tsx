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
                paddingTop="1rem"
            >
                <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                        ml="1em"
                        component="img"
                        width="50px"
                        height="50px"
                        display="flex"
                        src={logo}
                    ></Box>
                    <label> Spika </label>
                </Stack>

                <IconButton>
                    <AccountCircleRoundedIcon />
                </IconButton>
            </Stack>
            <Box position="relative" margin="1em">
                <SearchIcon
                    sx={{
                        color: "action.active",
                        mr: 1,
                        my: 0.5,
                        position: "absolute",
                        left: "0.3em",
                        top: "0.37em",
                    }}
                />
                <TextField
                    label="Search for contact, message, file ..."
                    sx={{ width: "100%", fontSize: 12, textIndent: "2em" }}
                    inputProps={{ style: { fontSize: 12, paddingLeft: "2.5em" } }}
                    InputLabelProps={{ style: { fontSize: 12 } }}
                />
            </Box>
            <Box margin="1em" marginTop="0" borderRadius={1}>
                <Stack
                    alignItems="center"
                    spacing={1}
                    direction="row"
                    margin="0.5em"
                    justifyContent="space-between"
                    sx={{ borderRadius: 1 }}
                >
                    <Stack alignItems="center" spacing={1} direction="row">
                        <IconButton>
                            <PublicIcon />
                        </IconButton>
                        <IconButton>
                            <PersonOutlineOutlinedIcon />
                        </IconButton>
                        <IconButton>
                            <PeopleOutlineOutlinedIcon />
                        </IconButton>
                    </Stack>

                    <IconButton
                        sx={{
                            marginLeft: "auto",
                            padding: 0,
                            backgroundColor: "#4696f0",
                            borderRadius: 1,
                        }}
                    >
                        <Stack alignItems="center" spacing={1} direction="row" sx={{ padding: 1 }}>
                            <label style={{ fontSize: 14, color: "white" }}> NEW </label>
                            <AddBoxIcon style={{ fill: "white" }} />
                        </Stack>
                    </IconButton>
                </Stack>
                <List dense={dense}>
                    {generate(
                        <ListItem>
                            <ListItemSecondaryAction sx={{ top: "40%" }}>
                                <Typography fontSize="0.75em">10:30</Typography>
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
