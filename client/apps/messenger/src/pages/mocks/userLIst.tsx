import React from "react";
import { Grid, Box } from "@mui/material";

import Screenshot from "../../../../../../documents/pages/userlist.png";

import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        mode: "light",
    },
});

export default function UserList(): React.ReactElement {
    return (
        <ThemeProvider theme={theme}>
            <Box>
                <Grid item xs={12} md={12}>
                    <img src={Screenshot} className="mock" />
                </Grid>
            </Box>
        </ThemeProvider>
    );
}
