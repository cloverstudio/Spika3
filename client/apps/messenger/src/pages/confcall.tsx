import React from "react";

import Container from "@mui/material/Container";

import { ThemeProvider } from "@mui/material/styles";
import { createTheme } from "@mui/material";

import { useNavigate } from "react-router-dom";

import Confcall from "../features/confcall";

export interface UrlParams {
    roomId: string;
    userId: string;
    userName: string;
}

const theme = createTheme({
    palette: {
        mode: "light",
    },
});
const urlSearchParams = new URLSearchParams(window.location.search);
const urlParamsTmp: any = Object.fromEntries(urlSearchParams.entries());
const urlParams: UrlParams = urlParamsTmp;

export default function ConfcallPage() {
    const navigate = useNavigate();

    return (
        <ThemeProvider theme={theme}>
            <Container component="main" maxWidth="xs">
                <Confcall
                    roomId={urlParams.roomId ? urlParams.roomId : "tmp"}
                    userId={urlParams.userId ? urlParams.userId : "tmp"}
                    userName={urlParams.userName ? urlParams.userName : "tmp"}
                    onClose={() => {
                        navigate("/");
                    }}
                />
            </Container>
        </ThemeProvider>
    );
}
