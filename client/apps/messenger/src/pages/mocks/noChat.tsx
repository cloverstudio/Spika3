import React from "react";
import { Grid, Box } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

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
