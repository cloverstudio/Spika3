import React, { useEffect } from "react";
import { Box, Button } from "@mui/material";
import { FiltersFormType } from "./EditFiltersDialog";
import countries from "../../../../../../../lib/countries";
import { Email } from "@mui/icons-material";

export default function FilterPills({
    filters,
    setFiltersLength,
}: {
    setFiltersLength: (number) => void;
    filters: FiltersFormType;
}) {
    const myFilters = { ...filters, ageFilter: "" };

    if (filters.minAge && filters.maxAge) {
        myFilters.ageFilter = `${filters.minAge}-${filters.maxAge} years old`;
    } else if (filters.minAge) {
        myFilters.ageFilter = `>${filters.minAge} years old`;
    } else if (filters.maxAge) {
        myFilters.ageFilter = `<${filters.maxAge} years old`;
    }

    delete myFilters.minAge;
    delete myFilters.maxAge;
    delete myFilters.keyword;

    const activeFilters = Object.entries(myFilters).filter(([_, v]) => v !== "" && v !== false);

    useEffect(() => {
        setFiltersLength(activeFilters.length);
    }, [activeFilters.length, setFiltersLength]);
    return (
        <Box flexWrap="wrap" px={3} display="flex" gap={0.5} alignItems="flex-start">
            {activeFilters.map(([key, value]) => {
                return <FilterInfoPill key={key} type={key} value={value} />;
            })}
        </Box>
    );
}

function FilterInfoPill({ type, value }) {
    const generateText = () => {
        switch (type) {
            case "email": {
                return (
                    <Box gap={0.5} display="flex" justifyContent="center" alignItems="center">
                        <Email sx={{ width: "1rem", color: "text.primary" }} /> {value}
                    </Box>
                );
            }
            case "country": {
                return countries.find((c) => c.code === value)?.label || "";
            }
            case "city": {
                return value;
            }
            case "ageFilter": {
                return value;
            }
            case "femaleGender": {
                return "Female";
            }
            case "maleGender": {
                return "Male";
            }
            case "otherGender": {
                return "Other";
            }

            default:
                return value;
        }
    };

    return (
        <Button
            component="span"
            sx={{
                cursor: "default",
                "&:hover": {
                    backgroundColor: "transparent",
                    borderColor: "gray",
                },
            }}
            variant="outlined"
            color="info"
            size="small"
        >
            {generateText()}
        </Button>
    );
}
