import React from "react";
import { Box } from "@mui/material";

import Base from "../components/Base";
import LeftSidebar from "../features/chat/LeftSidebar";
import { Outlet } from "react-router-dom";

export default function Home(): React.ReactElement {
    return (
        <Base>
            <Box
                display="grid"
                sx={{
                    gridTemplateColumns: {
                        xs: "1fr",
                        md: "minmax(320px, 420px) minmax(580px, 1fr)",
                    },
                }}
            >
                <LeftSidebar />
                <Outlet />
            </Box>
        </Base>
    );
}
