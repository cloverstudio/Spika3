import React from "react";

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
    return (
        <ThemeProvider theme={theme}>
            <Container component="main" maxWidth="xs">
                dddd
            </Container>
        </ThemeProvider>
    );
}
