import React, { useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    FormGroup,
    FormControlLabel,
    Checkbox,
    FormLabel,
    TextField,
    IconButton,
    Stack,
} from "@mui/material";

import useStrings from "../../../../hooks/useStrings";
import CountryAutocompletePicker from "../../../../components/CountryAutocompletePicker";
import CityAutocompletePicker from "../../../../components/CityAutocompletePicker";
import { Close } from "@mui/icons-material";

export type FiltersFormType = {
    minAge?: string;
    maxAge?: string;
    email?: string;
    country?: string;
    city?: string;
    maleGender?: boolean;
    femaleGender?: boolean;
    otherGender?: boolean;
    keyword?: string;
};

export const defaultFilters: FiltersFormType = {
    maleGender: false,
    femaleGender: false,
    otherGender: false,
    country: "",
    minAge: "",
    maxAge: "",
    email: "",
    city: "",
    keyword: "",
};

export interface EditFiltersDialogProps {
    onClose: () => void;
    initialFilters: FiltersFormType;
    onSave: (filters: FiltersFormType) => void;
}

export default function EditFiltersDialog({
    onClose,
    initialFilters,
    onSave,
}: EditFiltersDialogProps) {
    const strings = useStrings();

    const [filters, setFilters] = useState<FiltersFormType>(initialFilters);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSave(filters);
        onClose();
    };

    const handleChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };

        if (key === "country") {
            newFilters.city = "";
        }

        setFilters(newFilters);
    };

    const resetFilters = () => {
        setFilters(defaultFilters);
    };

    return (
        <Dialog onClose={onClose} open={true} maxWidth="xs">
            <DialogTitle sx={{ textAlign: "center" }}>{strings.filters}</DialogTitle>
            <IconButton
                disableRipple
                size="large"
                sx={{
                    ml: 1,
                    "&.MuiButtonBase-root:hover": {
                        bgcolor: "transparent",
                    },
                    margin: "0",
                    padding: "5px",
                    position: "absolute",
                    right: "10px",
                    top: "12px",
                }}
                onClick={onClose}
            >
                <Close />
            </IconButton>
            <Box
                minWidth={{ xs: "100%", md: 420 }}
                textAlign="left"
                component="form"
                p={4}
                onSubmit={(e) => handleSubmit(e)}
            >
                <Stack spacing={2} mb={4}>
                    <Box>
                        <FormLabel sx={{ mb: 1, display: "block" }}>{strings.gender}</FormLabel>

                        <FormGroup id="gender" row>
                            <FormControlLabel
                                value="male"
                                control={
                                    <Checkbox
                                        disableRipple
                                        checked={!!filters.maleGender}
                                        onChange={(e) =>
                                            handleChange("maleGender", e.target.checked)
                                        }
                                    />
                                }
                                label={strings.male}
                            />
                            <FormControlLabel
                                value="female"
                                control={
                                    <Checkbox
                                        disableRipple
                                        checked={!!filters.femaleGender}
                                        onChange={(e) =>
                                            handleChange("femaleGender", e.target.checked)
                                        }
                                    />
                                }
                                label={strings.female}
                            />
                            <FormControlLabel
                                value="other"
                                control={
                                    <Checkbox
                                        disableRipple
                                        checked={!!filters.otherGender}
                                        onChange={(e) =>
                                            handleChange("otherGender", e.target.checked)
                                        }
                                    />
                                }
                                label={strings.other}
                            />
                        </FormGroup>
                    </Box>
                    <Box>
                        <FormLabel sx={{ mb: 1, display: "block" }}>{strings.ageRange}</FormLabel>
                        <Stack direction="row" spacing={2}>
                            <TextField
                                fullWidth
                                id="minAge"
                                placeholder={strings.minAge}
                                name="minAge"
                                autoComplete="minAge"
                                value={filters.minAge}
                                type="number"
                                inputProps={{
                                    min: 0,
                                    max: +(filters.maxAge || 150) - 1,
                                }}
                                onChange={({ target }) => handleChange("minAge", target.value)}
                            />

                            <TextField
                                fullWidth
                                id="maxAge"
                                placeholder={strings.maxAge}
                                name="maxAge"
                                autoComplete="maxAge"
                                value={filters.maxAge}
                                type="number"
                                inputProps={{
                                    min: +(filters.minAge || -1) + 1,
                                    max: 150,
                                }}
                                onChange={({ target }) => handleChange("maxAge", target.value)}
                            />
                        </Stack>
                    </Box>

                    <Box>
                        <FormLabel sx={{ mb: 1, display: "block" }}>{strings.email}</FormLabel>
                        <TextField
                            fullWidth
                            id="email"
                            placeholder={strings.enter}
                            name="email"
                            autoComplete="email"
                            value={filters.email}
                            onChange={({ target }) => handleChange("email", target.value)}
                        />
                    </Box>

                    <CountryAutocompletePicker
                        required={false}
                        value={filters.country}
                        onChange={(v) => handleChange("country", v)}
                    />

                    {filters.country && (
                        <CityAutocompletePicker
                            required={false}
                            country={filters.country}
                            value={filters.city}
                            onChange={(v) => handleChange("city", v)}
                        />
                    )}
                </Stack>
                <Button type="submit" variant="contained">
                    {strings.apply}
                </Button>
                <Button type="button" onClick={resetFilters} sx={{ ml: 1 }} variant="text">
                    {strings.reset}
                </Button>
            </Box>
        </Dialog>
    );
}
