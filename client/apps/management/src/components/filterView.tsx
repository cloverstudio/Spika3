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
import { setFilter } from "../store/filterSlice";
import { useDispatch } from "react-redux";

export interface FilterViewProps {
    type: FilterType;
}

export default function FilterView(props: FilterViewProps) {
    const { type } = props;
    const dispatch = useDispatch();
    const [value, setValue] = React.useState("");
    const [title, setTitle] = React.useState("");
    const [filterOptions, setFilterOptions] = React.useState([]);

    const handleChange = (event: SelectChangeEvent) => {
        setValue(event.target.value);
        setFilterValue(event.target.value);
    };

    const setFilterValue = (value: any) => {
        const trueValue = Number(value);
        var filterString = "";
        switch (type) {
            case FilterType.None: {
                break;
            }
            case FilterType.User: {
                if (trueValue == 0) {
                    filterString = "true";
                }
                if (trueValue == 1) {
                    filterString = "false";
                }

                break;
            }
            case FilterType.Device: {
                break;
            }
            case FilterType.Room: {
                if (trueValue == 1) {
                    filterString = "group";
                }
                if (trueValue == 2) {
                    filterString = "private";
                }
                break;
            }
            default: {
                //statements;
                break;
            }
        }
        dispatch(
            setFilter({
                filterType: filterString,
            })
        );
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
                    setFilterOptions(["", "Group", "Private"]);
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
                            label={title}
                            onChange={handleChange}
                        >
                            {filterOptions.map((item, index) => (
                                <MenuItem sx={{ height: "50px" }} value={index} key={index}>
                                    {item}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            ) : null}
        </Paper>
    );
}
