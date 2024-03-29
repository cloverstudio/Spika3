import React from "react";
import { Box } from "@mui/material";

import SearchBox from "../SearchBox";

export default function SidebarCallList(): React.ReactElement {
    return (
        <Box textAlign="center" sx={{ overflowY: "auto" }}>
            <Box mt={3}>
                <SearchBox />
            </Box>
        </Box>
    );
}
