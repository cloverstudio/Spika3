import React, { useEffect, useState } from "react";
import { Box, Select, MenuItem, SxProps } from "@mui/material";

export default function Main() {
    return (
        <Box
            sx={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "common.confCallBackground",
                border: "none",
                zIndex: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            main
        </Box>
    );
}
