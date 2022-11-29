import React, { useEffect, useState } from "react";
import { Box, TextField, Autocomplete, FormLabel } from "@mui/material";
import useStrings from "../hooks/useStrings";
import { useLazyGetCitiesQuery } from "../api/utils";
import useDebounce from "../hooks/useDebounce";

export default function CityAutocompletePicker({
    value,
    onChange,
    country,
    required = true,
}: {
    country: string;
    value: string;
    required?: boolean;
    onChange: (string) => void;
}) {
    const strings = useStrings();
    const [inputText, setInputText] = useState("");
    const [fetchCities, { data, isFetching, isLoading }] = useLazyGetCitiesQuery();
    const debouncedInputText = useDebounce(inputText, 500);

    const handleInputChange = (_, v: string) => {
        setInputText(v);
    };

    useEffect(() => {
        if (debouncedInputText) {
            fetchCities({ country, inputText: debouncedInputText });
        }
    }, [debouncedInputText, country, fetchCities]);

    const options = [...(data || [])];

    if (value && !options.find((o) => o.value === value)) {
        options.push({ label: value, value });
    }

    const handleChange = (_, v: { value: string; label: string }) => {
        onChange(v?.value || "");
    };

    return (
        <Box>
            <FormLabel sx={{ mb: 1, display: "block" }}>{strings.city}</FormLabel>

            <Autocomplete
                id="city-select"
                loading={isLoading || isFetching}
                loadingText={strings.loadingText}
                fullWidth
                options={data || []}
                autoHighlight
                filterOptions={(x) => x}
                inputValue={inputText}
                onInputChange={handleInputChange}
                value={options.find((o) => o.value === value) || null}
                onChange={handleChange}
                renderOption={(props, option) => (
                    <Box component="li" {...props}>
                        {option.label}
                    </Box>
                )}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        required={required}
                        placeholder={strings.startTyping}
                        inputProps={{
                            ...params.inputProps,
                        }}
                    />
                )}
            />
        </Box>
    );
}
