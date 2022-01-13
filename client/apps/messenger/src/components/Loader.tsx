import React from "react";

import Base from "../components/Base";
import { Stack } from "@mui/material";
import logo from "../assets/logo.svg";

export default function Loader(): React.ReactElement {
    return (
        <Stack minHeight="95vh" width="100%" justifyContent="center" alignItems="center">
            <img src={logo} />
        </Stack>
    );
}
