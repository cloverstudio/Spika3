import React from "react";
import { Box, TextField, Autocomplete, FormLabel } from "@mui/material";
import countries, { CountryType } from "../../../../lib/countries";
import useStrings from "../hooks/useStrings";

export default function CountryAutocompletePicker({
    value,
    onChange,
    required = true,
}: {
    value: string;
    required?: boolean;
    onChange: (string) => void;
}) {
    const strings = useStrings();

    const handleChange = (_, v: CountryType) => {
        onChange(v?.code || "");
    };

    return (
        <Box>
            <FormLabel sx={{ mb: 1, display: "block" }}>{strings.country}</FormLabel>

            <Autocomplete
                id="country-select"
                fullWidth
                options={countries}
                autoHighlight
                value={countries.find((v) => v.code === value) || null}
                onChange={handleChange}
                renderOption={(props, option) => (
                    <Box component="li" sx={{ "& > img": { mr: 2, flexShrink: 0 } }} {...props}>
                        <img
                            loading="lazy"
                            width="20"
                            src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                            srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
                            alt=""
                        />
                        {option.label}
                    </Box>
                )}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        required={required}
                        placeholder={strings.select}
                        inputProps={{
                            ...params.inputProps,
                            autoComplete: "new-password",
                        }}
                    />
                )}
            />
        </Box>
    );
}
