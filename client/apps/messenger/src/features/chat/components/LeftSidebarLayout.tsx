import React from "react";
import { Box } from "@mui/material";

export default function LeftSidebarLayout({
    children,
}: {
    children: React.ReactElement | React.ReactElement[];
}): React.ReactElement {
    return (
        <Box
            borderRight="0.5px solid #C9C9CA"
            height="100vh"
            overflow="hidden"
            display="flex"
            flexDirection="column"
            sx={{ width: { xs: "100vw", md: "auto" } }}
        >
            {children}
        </Box>
    );
}
