import React, { useState } from "react";
import { Box } from "@mui/material";
import Input from "@mui/material/Input";
import InputAdornment from "@mui/material/InputAdornment";
import Search from "@mui/icons-material/Search";
import useStrings from "../../../hooks/useStrings";
import CancelIcon from "@mui/icons-material/Cancel";
import { CSSProperties } from "@mui/material/styles/createMixins";

type SearchBoxProps = {
    onSearch?: (keyword: string) => void;
    customStyles?: CSSProperties;
    marginBottom?: number | null;
    onFocus?: () => void;
};

let timer: NodeJS.Timeout;

export default function SearchBox({
    onSearch,
    customStyles,
    marginBottom = 2,
    onFocus,
}: SearchBoxProps): React.ReactElement {
    const strings = useStrings();
    const [keyword, setKeyword] = useState("");

    return (
        <Box mb={marginBottom} px={2.5} sx={customStyles}>
            <Input
                disableUnderline={true}
                startAdornment={
                    <InputAdornment sx={{ pr: 2 }} position="start">
                        <Search sx={{ width: "18px", color: "text.tertiary" }} />
                    </InputAdornment>
                }
                fullWidth
                autoFocus
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
                onFocus={onFocus}
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

type ControlledSearchBoxProps = {
    onSearch?: (keyword: string) => void;
    marginBottom?: number | null;
    keyword: string;
    setKeyword: (keyword: string) => void;
};

export function ControlledSearchBox({
    onSearch,
    marginBottom = 2,
    keyword,
    setKeyword,
}: ControlledSearchBoxProps): React.ReactElement {
    const strings = useStrings();

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
