import React from "react";

import {
    ListSubheader,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Container,
} from "@mui/material";

import { createTheme, ThemeProvider } from "@mui/material/styles";

import { Link, useNavigate } from "react-router-dom";

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

export default function () {
    let navigate = useNavigate();

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
