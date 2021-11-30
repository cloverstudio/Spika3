import * as React from "react";
import Layout from "../layout";

import { Typography, Paper, Fab } from "@mui/material";

import { Menu as MenuIcon, Add as AddIcon } from "@mui/icons-material/";

export default function Dashboard() {
    return (
        <Layout subtitle="Dashboard">
            <Paper
                sx={{
                    margin: "24px",
                    padding: "24px",
                    minHeight: "calc(100vh-64px)",
                }}
            ></Paper>
        </Layout>
    );
}
