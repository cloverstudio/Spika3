import React from "react";
import { Box } from "@mui/material";
import Input from "@mui/material/Input";
import InputAdornment from "@mui/material/InputAdornment";
import Search from "@mui/icons-material/Search";
import useStrings from "../../../hooks/useStrings";

type SearchBoxProps = {
    onSearch?: (keyword: string) => void;
};

let timer: NodeJS.Timeout;

export default function SearchBox({ onSearch }: SearchBoxProps): React.ReactElement {
    const strings = useStrings();
    return (
        <Box px={2.5} mb={2}>
            <Input
                disableUnderline={true}
                startAdornment={
                    <InputAdornment sx={{ pr: 2 }} position="start">
                        <Search sx={{ width: "18px", color: "text.tertiary" }} />
                    </InputAdornment>
                }
                fullWidth
                id="search"
                placeholder={strings.search}
                sx={{
                    backgroundColor: "background.paper",
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
