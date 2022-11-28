import React from "react";
import { Box, Input, InputAdornment } from "@mui/material";
import { Search } from "@mui/icons-material";

type SearchBoxProos = {
    onSearch?: (keyword: string) => void;
};

let timer: NodeJS.Timeout;

export default function SearchBox({ onSearch }: SearchBoxProos): React.ReactElement {
    return (
        <Box px={2.5}>
            <Input
                disableUnderline={true}
                startAdornment={
                    <InputAdornment sx={{ pr: 2 }} position="start">
                        <Search sx={{ width: "18px", color: "text.tertiary" }} />
                    </InputAdornment>
                }
                fullWidth
                placeholder="Search"
                sx={{
                    backgroundColor: "common.chatBackground",
                    px: "20px",
                    py: "9px",
                    input: {
                        padding: 0,
                    },
                }}
                onChange={(e) => {
                    if (timer) clearTimeout(timer);
                    if (onSearch) {
                        timer = setTimeout(() => {
                            onSearch(e.target.value);
                        }, 500);
                    }
                }}
            />
        </Box>
    );
}
