import React, { useState } from "react";
import { Box } from "@mui/material";
import Input from "@mui/material/Input";
import InputAdornment from "@mui/material/InputAdornment";
import Search from "@mui/icons-material/Search";
import useStrings from "../../../hooks/useStrings";
import CancelIcon from "@mui/icons-material/Cancel";

type SearchBoxProps = {
    onSearch?: (keyword: string) => void;
    marginBottom?: number | null;
    isMobile?: boolean;
};

let timer: NodeJS.Timeout;

export default function SearchBox({
    onSearch,
    marginBottom = 2,
    isMobile,
}: SearchBoxProps): React.ReactElement {
    const strings = useStrings();
    const [keyword, setKeyword] = useState("");

    return (
        <Box mb={marginBottom} px={2.5}>
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
                value={keyword}
                onChange={(e) => {
                    const value = e.target.value;
                    setKeyword(value);
                    if (timer) clearTimeout(timer);
                    if (onSearch) {
                        timer = setTimeout(() => {
                            onSearch(value);
                        }, 500);
                    }
                }}
                endAdornment={
                    <InputAdornment sx={{ pl: 2 }} position="end">
                        {keyword?.length > 0 && (
                            <Box display="flex" alignItems="center">
                                <CancelIcon
                                    onClick={() => {
                                        setKeyword("");
                                        onSearch("");
                                    }}
                                    sx={{ color: "text.tertiary", cursor: "pointer" }}
                                />
                            </Box>
                        )}
                    </InputAdornment>
                }
            />
        </Box>
    );
}
