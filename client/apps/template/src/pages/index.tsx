import React from "react";
import { Container } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        mode: "light",
    },
});

export default function Index(): React.ReactElement {
    return (
        <ThemeProvider theme={theme}>
            <Container component="main" maxWidth="xs">
                Hello World
            </Container>
        </ThemeProvider>
    );
}
