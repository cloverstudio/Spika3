import React from "react";
import { useHistory } from "react-router-dom";
import {
    ListSubheader,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Collapse,
    Link,
    Container,
} from "@mui/material";

import {
    Inbox as InboxIcon,
    Drafts as DraftsIcon,
    Send as SendIcon,
    ContactPageOutlined as ContactPageOutlinedIcon,
} from "@mui/icons-material";

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
                Hello World
            </Container>
        </ThemeProvider>
    );
}
