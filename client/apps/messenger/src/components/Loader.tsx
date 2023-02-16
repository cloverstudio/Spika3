import React from "react";

import Stack from "@mui/material/Stack";
import logo from "../assets/logo.svg";

export default function Loader(): React.ReactElement {
    return (
        <Stack minHeight="95vh" width="100%" justifyContent="center" alignItems="center">
            <img src={logo} />
        </Stack>
    );
}
