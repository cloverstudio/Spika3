import React from "react";
import { Container } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import Confcall from "../features/confcall";

const theme = createTheme({
    palette: {
        mode: "light",
    },
});

export default function ConfCall(): React.ReactElement {
    return (
        <ThemeProvider theme={theme}>
            <Container component="main" maxWidth="xs">
                <Confcall />
            </Container>
        </ThemeProvider>
    );
}
