import React from "react";
import { Box } from "@mui/material";

export default function ButtonsHolder(props: any) {
    return (
        <Box
            sx={{
                textAlign: "center",
                color: "common.confCallControls",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100px",
                height: "100px",
                "&:hover": {
                    backgroundColor: "common.confCallControlsHoverBackground",
                },
            }}
        >
            {props.children}
        </Box>
    );
}
