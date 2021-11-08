import React from "react";
import { createTheme, ThemeProvider, styled } from "@mui/material/styles";
import { Box, Stack, Button, IconButton, InputBase } from "@mui/material";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import SentimentSatisfiedRoundedIcon from "@mui/icons-material/SentimentSatisfiedRounded";

const theme = createTheme({
    palette: {
        mode: "light",
    },
});

const ChatInputBar = () => {
    return (
        <ThemeProvider theme={theme}>
            <Box className="input-box">
                <Stack alignItems="center" spacing={1} direction="row">
                    <ControlPointIcon />
                    <InputBase
                        className="text-field-box"
                        placeholder="Type here..."
                        inputProps={{ style: { fontSize: 12 } }}
                    />
                    <SentimentSatisfiedRoundedIcon />
                </Stack>
            </Box>
        </ThemeProvider>
    );
};

export default ChatInputBar;
