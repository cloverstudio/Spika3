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
    ToggleButton,
    ToggleButtonGroup,
} from "@mui/material";
import logo from "../../../../../../documents/pages/login_logo.svg";
import { createTheme, ThemeProvider, styled } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import PublicIcon from "@mui/icons-material/Public";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import AddBoxIcon from "@mui/icons-material/AddBox";
import {
    DriveFileRenameOutlineOutlined,
    Settings,
    Message,
    Call,
    AccountCircle,
} from "@mui/icons-material";

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
    const [recentState, setRecentState] = React.useState<string | null>("left");

    const handleRecentState = (event: React.MouseEvent<HTMLElement>, newState: string | null) => {
        setRecentState(newState);
    };
    return (
        <ThemeProvider theme={theme}>
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
                width="100%"
                paddingTop="1rem"
                sx={{ borderBottom: 1, borderColor: "lightGrey", paddingBottom: 1.5 }}
            >
                <Box
                    ml="1em"
                    component="img"
                    width="50px"
                    height="50px"
                    display="flex"
                    src={logo}
                ></Box>

                <Stack direction="row" alignItems="center" spacing={1} pr="2em">
                    <Avatar
                        alt="Remy Sharp"
                        src="../../../../../../documents/pages/login_robot_image.svg"
                    />
                    <IconButton sx={{ marginLeft: 1 }}>
                        <Settings />
                    </IconButton>
                    <IconButton>
                        <DriveFileRenameOutlineOutlined />
                    </IconButton>
                </Stack>
            </Stack>
            <ToggleButtonGroup
                color="info"
                size="large"
                value={recentState}
                exclusive
                onChange={handleRecentState}
                aria-label="text alignment"
                sx={{ p: "1.5em", justifyContent: "space-between" }}
            >
                <ToggleButton value="left" aria-label="left aligned" sx={{ border: 0 }}>
                    <Message />
                </ToggleButton>
                <ToggleButton value="center" aria-label="centered" sx={{ border: 0 }}>
                    <Call />
                </ToggleButton>
                <ToggleButton value="right" aria-label="right aligned" sx={{ border: 0 }}>
                    <AccountCircle />
                </ToggleButton>
            </ToggleButtonGroup>
            <Box
                sx={{ display: "flex", alignItems: "flex-end", paddingBottom: 1 }}
                ml="1em"
                mr="1em"
                bgcolor="lightGray"
                borderRadius="1em"
            >
                <SearchIcon sx={{ color: "action.active", ml: 1, mr: 1, my: 0.5 }} />
                <TextField
                    id="searchInput"
                    label="Search"
                    variant="standard"
                    sx={{ width: "85%" }}
                    InputProps={{ disableUnderline: true }}
                />
            </Box>
            <Box margin="1em" marginTop="0" borderRadius={1}>
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
