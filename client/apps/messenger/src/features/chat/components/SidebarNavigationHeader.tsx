import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { ArrowBackIos as ArrowBackIosIcon } from "@mui/icons-material";

export default function SidebarNavigationHeader({
    handleBack,
    title,
}: {
    handleBack: () => void;
    title: string;
}): React.ReactElement {
    return (
        <Box borderBottom="0.5px solid #C9C9CA" mb={1}>
            <Box height="80px" px={2.5} display="flex" alignContent="center" alignItems="center">
                <IconButton
                    aria-label="back"
                    sx={{ padding: 1, mr: 2.5 }}
                    onClick={() => handleBack()}
                >
                    <ArrowBackIosIcon sx={{ color: "#141414" }} />
                </IconButton>
                <Typography fontWeight={500} lineHeight="">
                    {title}
                </Typography>
            </Box>
        </Box>
    );
}
