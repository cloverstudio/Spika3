import React from "react";
import { createTheme, ThemeProvider, styled } from "@mui/material/styles";
import { Box, Stack, Button,IconButton } from "@mui/material";

const theme = createTheme({
    palette: {
      mode: "light",
    },
  })

const ChatInputBar = () => {
    return (
        <ThemeProvider theme={theme}>
            <Box>
                Bokic
            </Box>
           
        </ThemeProvider>
    )
};

export default ChatInputBar;