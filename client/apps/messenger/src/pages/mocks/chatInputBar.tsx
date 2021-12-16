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
            <Box
                height="2.5em"
                ml="1em"
                mr="1em"
                borderColor="black"
                borderRadius="0.2em"
                sx={{ borderWidth: "1px", borderStyle: "double" }}
            >
                <Stack alignItems="center" spacing={1} direction="row">
                    <ControlPointIcon />
                    <InputBase
                        sx={{ width: "95%", borderStyle: "none" }}
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
