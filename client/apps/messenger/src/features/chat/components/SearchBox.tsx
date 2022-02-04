import React from "react";
import { Box, Input, InputAdornment } from "@mui/material";
import { Search } from "@mui/icons-material";

export default function SearchBox(): React.ReactElement {
    return (
        <Box px={2.5} mb={2}>
            <Input
                disableUnderline={true}
                startAdornment={
                    <InputAdornment sx={{ pr: 2 }} position="start">
                        <Search sx={{ width: "18px", color: "#9AA0A6" }} />
                    </InputAdornment>
                }
                fullWidth
                placeholder="Search"
                sx={{
                    backgroundColor: "#F2F2F2",
                    px: "20px",
                    py: "9px",
                    input: {
                        padding: 0,
                    },
                }}
            />
        </Box>
    );
}
