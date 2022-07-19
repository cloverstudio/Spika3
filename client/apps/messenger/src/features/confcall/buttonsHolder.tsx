import React, { useEffect, useState } from "react";
import { Box, Grid, useMediaQuery } from "@mui/material";

export default (props: any) => {
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
};
