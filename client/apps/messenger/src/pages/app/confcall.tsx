import React, { useEffect, useState, useRef, MutableRefObject, useContext } from "react";
import { Button, Container } from "@mui/material";
import { Box, Typography } from "@mui/material";
import { ContactPageOutlined as ContactPageOutlinedIcon } from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ConfcallDummy from "../../components/confcalldummy";
import Confcall from "../../components/confcall";
import "../../style/spikabroadcast.scss";

const theme = createTheme({
    palette: {
        mode: "light",
    },
});

export default function () {
    const [showConfcall, setShowConfcall] = useState<boolean>(false);

    return (
        <ThemeProvider theme={theme}>
            <Container component="main" maxWidth="xs">
                {ConfcallDummy ? (
                    <Box
                        position="absolute"
                        left="0px"
                        top="0px"
                        width="100vw"
                        height="100vh"
                        overflow="hidden"
                    >
                        <Confcall
                            onClose={() => {
                                setShowConfcall(false);
                            }}
                        />
                    </Box>
                ) : (
                    <Box display="flex" alignItems="center" justifyContent="center" height="100vh">
                        <Button
                            onClick={() => {
                                setShowConfcall(true);
                            }}
                        >
                            Show
                        </Button>
                    </Box>
                )}
            </Container>
        </ThemeProvider>
    );
}
