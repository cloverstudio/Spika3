import React from "react";
import { useHistory } from "react-router-dom";
import { Grid, Box, Container } from "@mui/material";

import Screenshot from "../../../../../../documents/pages/chat_nomessage.png";

import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
  },
});

export default function () {
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
