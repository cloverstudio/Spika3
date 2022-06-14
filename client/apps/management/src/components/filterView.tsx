import React, { useEffect } from "react";
import {
    Paper,
    Typography,
    InputLabel,
    MenuItem,
    FormControl,
    Select,
    SelectChangeEvent,
    Box,
} from "@mui/material";
import theme from "../theme";
import { FilterType } from "../pages/layout";

export interface FilterViewProps {
    type: FilterType;
    onSelect: (value: string) => void;
}

export default function FilterView(props: FilterViewProps) {
    const { type, onSelect } = props;

    const [value, setValue] = React.useState("");
    const [title, setTitle] = React.useState("");
    const [filterOptions, setFilterOptions] = React.useState([]);

    const handleChange = (event: SelectChangeEvent) => {
        setValue(event.target.value);
        onSelect(event.target.value);
    };

    useEffect(() => {
        (async () => {
            switch (type) {
                case FilterType.None: {
                    break;
                }
                case FilterType.User: {
                    setTitle("Verified");
                    setFilterOptions(["Yes", "No"]);
                    break;
                }
                case FilterType.Device: {
                    setTitle("OS Type");
                    setFilterOptions(["iOS", "Android"]);
                    break;
                }
                case FilterType.Room: {
                    setTitle("Room Type");
                    setFilterOptions(["Group", "Private"]);
                    break;
                }
                default: {
                    //statements;
                    break;
                }
            }
        })();
    }, [type]);

    return (
        <Paper sx={{ margin: "24px", padding: "24px" }}>
            {type != FilterType.None ? (
                <Box>
                    <Typography variant="h6" color="lightgrey">
                        Search filters
                    </Typography>
                    <FormControl sx={{ m: 1, minWidth: 400 }} size="small">
                        <InputLabel id="demo-select-small">{title}</InputLabel>
                        <Select
                            labelId="demo-select-small"
                            id="demo-select-small"
                            value={value}
                            label="Age"
                            onChange={handleChange}
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            {filterOptions.map((item) => (
                                <MenuItem value={item}>{item}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            ) : null}
        </Paper>
    );
}
