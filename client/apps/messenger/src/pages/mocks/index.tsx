import React from "react";
import { useHistory } from "react-router-dom";
import {
    ListSubheader,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Container,
} from "@mui/material";

import { ContactPageOutlined as ContactPageOutlinedIcon } from "@mui/icons-material";

import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        mode: "light",
    },
});

export default function () {
    let history = useHistory();

    return (
        <ThemeProvider theme={theme}>
            <Container component="main" maxWidth="xs">
                <List
                    sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
                    component="nav"
                    aria-labelledby="nested-list-subheader"
                    subheader={
                        <ListSubheader component="div" id="nested-list-subheader">
                            Mockups
                        </ListSubheader>
                    }
                >
                    <ListItemButton onClick={(e) => history.push("/mock/chat")}>
                        <ListItemIcon>
                            <ContactPageOutlinedIcon />
                        </ListItemIcon>
                        <ListItemText primary="Chat" />
                    </ListItemButton>
                    <ListItemButton onClick={(e) => history.push("/mock/chat_nomessage_userlist")}>
                        <ListItemIcon>
                            <ContactPageOutlinedIcon />
                        </ListItemIcon>
                        <ListItemText primary="Userlist" />
                    </ListItemButton>
                    <ListItemButton onClick={(e) => history.push("/mock/chat_medialist")}>
                        <ListItemIcon>
                            <ContactPageOutlinedIcon />
                        </ListItemIcon>
                        <ListItemText primary="Chat Media" />
                    </ListItemButton>
                    <ListItemButton onClick={(e) => history.push("/mock/nochat")}>
                        <ListItemIcon>
                            <ContactPageOutlinedIcon />
                        </ListItemIcon>
                        <ListItemText primary="No Chat" />
                    </ListItemButton>
                    <ListItemButton onClick={(e) => history.push("/mock/chat_medialist")}>
                        <ListItemIcon>
                            <ContactPageOutlinedIcon />
                        </ListItemIcon>
                        <ListItemText primary="Chat Media List" />
                    </ListItemButton>
                    <ListItemButton onClick={(e) => history.push("/mock/chat_nomessage_userlist")}>
                        <ListItemIcon>
                            <ContactPageOutlinedIcon />
                        </ListItemIcon>
                        <ListItemText primary="Chat No messages User list" />
                    </ListItemButton>
                    <ListItemButton onClick={(e) => history.push("/mock/chat_small_sidebar")}>
                        <ListItemIcon>
                            <ContactPageOutlinedIcon />
                        </ListItemIcon>
                        <ListItemText primary="Chat Small Sidebar" />
                    </ListItemButton>
                    <ListItemButton onClick={(e) => history.push("/mock/chat_nomessage")}>
                        <ListItemIcon>
                            <ContactPageOutlinedIcon />
                        </ListItemIcon>
                        <ListItemText primary="No Messages" />
                    </ListItemButton>
                    <ListItemButton onClick={(e) => history.push("/mock/nochat")}>
                        <ListItemIcon>
                            <ContactPageOutlinedIcon />
                        </ListItemIcon>
                        <ListItemText primary="No Chat" />
                    </ListItemButton>
                    <ListItemButton onClick={(e) => history.push("/mock/conferenceCallView")}>
                        <ListItemIcon>
                            <ContactPageOutlinedIcon />
                        </ListItemIcon>
                        <ListItemText primary="Conference call (Vedran)" />
                    </ListItemButton>
                    <ListItemButton onClick={(e) => history.push("/mock/confcall")}>
                        <ListItemIcon>
                            <ContactPageOutlinedIcon />
                        </ListItemIcon>
                        <ListItemText primary="Conference call" />
                    </ListItemButton>
                </List>
            </Container>
        </ThemeProvider>
    );
}
