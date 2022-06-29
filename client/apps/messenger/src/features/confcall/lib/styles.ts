import React, { useEffect, useState } from "react";
import { Box, Select, MenuItem, SxProps } from "@mui/material";
import { CSSProperties } from "@mui/styled-engine";

export const controlIconDefaultStyle: SxProps = {
    padding: "10px",
    width: "60px",
    height: "60px",
    cursor: "pointer",
};

export const controlArrowIconDefaultStyle: SxProps = {
    opacity: 0.8,
    cursor: "pointer",
    "&:hover": {
        opacity: 1.0,
    },
};
