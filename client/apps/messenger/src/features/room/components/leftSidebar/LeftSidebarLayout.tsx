import React from "react";
import { Box } from "@mui/material";

export default function LeftSidebarLayout({
    children,
}: {
    children: React.ReactElement | React.ReactElement[];
}): React.ReactElement {
    return (
        <Box
            borderRight="1px solid"
            height="100vh"
            overflow="hidden"
            display="flex"
            flexDirection="column"
            sx={{ width: { xs: "100vw", md: "auto" },borderColor:"divider" }}
        >
            {children}
        </Box>
    );
}
