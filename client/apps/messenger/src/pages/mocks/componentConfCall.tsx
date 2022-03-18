import React from "react";
import { Button, Box } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ConferenceCall from "./conferenceCallView";

const theme = createTheme({
    palette: {
        mode: "light",
    },
});

export default function () {
    const [showConferenceCall, setShowConferenceCall] = React.useState(false);
    const handleClose = () => {
        setShowConferenceCall(false);
    };
    return (
        <ThemeProvider theme={theme}>
            {!showConferenceCall ? (
                <Box
                    sx={{ width: "100vw", height: "100vh" }}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                >
                    <Button
                        variant="outlined"
                        onClick={() => {
                            setShowConferenceCall(true);
                        }}
                    >
                        Conference Call
                    </Button>
                </Box>
            ) : (
                <Box sx={{ width: "100vw", height: "100vh" }}>
                    <ConferenceCall roomId="1" userId="1" userName="testko" onClose={handleClose} />
                </Box>
            )}
        </ThemeProvider>
    );
}
