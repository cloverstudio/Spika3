import React from "react";
import { useHistory } from "react-router-dom";
import { Grid, Box, Container } from "@mui/material";

import Screenshot from "../../../../../../documents/pages/nochat.png";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { width } from "@mui/system";

const theme = createTheme({
    palette: {
        mode: "light",
    },
});

export default function () {
    return (
        <ThemeProvider theme={theme}>
            <Box bgcolor="#00FF00" sx={{ width: 100, height: "100vh" }}>
                <Grid item xs={12} md={12}></Grid>
            </Box>
        </ThemeProvider>
    );
}
