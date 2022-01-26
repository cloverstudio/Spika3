import React from "react";
import { useHistory } from "react-router-dom";
import { Grid, Box, Container } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { PrismaClient, User } from "@prisma/client";

//////////////////////////////////////////////////////
// Sample data
//////////////////////////////////////////////////////
export interface Participant {
    user: {
        displayName: string;
        avatarUrl: string;
    };
    videoEnabled: boolean;
    audioEnabled: boolean;
}

export const me: Participant = {
    user: {
        displayName: "Vedran",
        avatarUrl: "",
    },
    videoEnabled: true,
    audioEnabled: true,
};

const participant1: Participant = {
    user: {
        displayName: "Ken",
        avatarUrl: "",
    },
    videoEnabled: true,
    audioEnabled: true,
};

const participant2: Participant = {
    user: {
        displayName: "Yumiko",
        avatarUrl: "",
    },
    videoEnabled: false,
    audioEnabled: true,
};

const participant3: Participant = {
    user: {
        displayName: "Mislav",
        avatarUrl: "",
    },
    videoEnabled: true,
    audioEnabled: true,
};

const participant4: Participant = {
    user: {
        displayName: "Ivo",
        avatarUrl: "",
    },
    videoEnabled: true,
    audioEnabled: true,
};

export const participants = [
    participant1,
    participant2,
    participant3,
    participant4,
    participant4,
    participant4,
    participant4,
];

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
                    ssdd
                </Grid>
            </Box>
        </ThemeProvider>
    );
}
