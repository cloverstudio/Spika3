import React from "react";
import {
    Autocomplete,
    Box,
    Button,
    Dialog,
    FormControlLabel,
    FormLabel,
    IconButton,
    Radio,
    RadioGroup,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import countries from "../../../auth/lib/countries";

import { useAppDispatch, useAppSelector } from "../../../../hooks";
import {
    fetchContacts,
    resetContactsListPagination,
    setAdvanceFilters,
    setAdvanceFiltersApplied,
    setAdvanceFiltersModalOpen,
} from "../../slices/contacts";
import { Close } from "@mui/icons-material";

import { genderOptions } from "../../lib/formOptionData";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export function AdvanceFiltersModal({ isOpen, onClose }: Props) {
    const { t, i18n } = useTranslation();
    const currentLanguage = i18n.language;

    const dispatch = useAppDispatch();
    const displayName = useAppSelector((state) => state.contacts.advanceFilters.displayName);
    const country = useAppSelector((state) => state.contacts.advanceFilters.country);
    const gender = useAppSelector((state) => state.contacts.advanceFilters.gender);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const isFilterButtonDisabled = !displayName && !country && !gender;

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            scroll="body"
            sx={{
                ".MuiDialog-paper": {
                    width: "470px",
                },
            }}
        >
            <Box
                sx={{
                    backgroundColor: "background.paper",
                    padding: isMobile ? "32px 16px" : "32px",
                    outline: "none",
                    position: "relative",
                    overflow: "hidden",
                    textAlign: "left",
                }}
            >
                <IconButton
                    size="large"
                    onClick={onClose}
                    sx={{
                        position: "absolute",
                        top: "18px",
                        right: "16px",
                    }}
                >
                    <Close
                        sx={{
                            color: "text.secondary",
                        }}
                    />
                </IconButton>

                <Typography
                    sx={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "text.secondary",
                        mb: 4,
                        textAlign: "center",
                    }}
                >
                    {t("filters")}
                </Typography>

                <FormLabel
                    htmlFor="nameAndSurname"
                    sx={{ display: "block", fontSize: "14px", mb: 1, color: "text.secondary" }}
                >
                    {t("nameAndSurname")}
                </FormLabel>
                <TextField
                    fullWidth
                    placeholder={t("nameAndSurname")}
                    id="nameAndSurname"
                    variant="outlined"
                    InputProps={{
                        sx: {
                            borderRadius: "10px",
                            fontSize: "16px",
                            "&:hover": {
                                borderColor: "#000",
                            },
                            "&.Mui-focused": {
                                borderColor: "#1976d2",
                            },
                            "& ::placeholder": { fontSize: "16px" },
                        },
                    }}
                    onChange={(e) => {
                        if (e.target.value.length < 100)
                            dispatch(
                                setAdvanceFilters({
                                    displayName: e.target.value,
                                }),
                            );
                    }}
                    onBlur={(e) => {
                        dispatch(
                            setAdvanceFilters({
                                displayName: e.target.value,
                            }),
                        );
                    }}
                    value={displayName || ""}
                />
                <FormLabel
                    htmlFor="countrySelect"
                    sx={{
                        display: "block",
                        fontSize: "14px",
                        mb: 1,
                        color: "text.secondary",
                        mt: 4,
                    }}
                >
                    {t("country")}
                </FormLabel>
                <Autocomplete
                    disablePortal
                    id="countrySelect"
                    options={countries}
                    renderInput={(params) => <TextField {...params} placeholder={t("country")} />}
                    value={countries.find((c) => c.code === country) || null}
                    fullWidth
                    onChange={(e, value) => {
                        dispatch(setAdvanceFilters({ country: value?.code || "" }));
                    }}
                    getOptionLabel={(option) => option[`label${currentLanguage.toUpperCase()}`]}
                />

                <FormLabel
                    sx={{
                        display: "block",
                        fontSize: "14px",
                        mb: 1,
                        color: "text.secondary",
                        mt: 4,
                    }}
                >
                    {t("gender")}
                </FormLabel>
                <RadioGroup
                    row
                    aria-labelledby="demo-row-radio-buttons-group-label"
                    name="row-radio-buttons-group"
                    sx={{ justifyContent: "space-between" }}
                    onChange={(e) => dispatch(setAdvanceFilters({ gender: e.target.value }))}
                    value={gender || ""}
                >
                    {genderOptions.map((option) => (
                        <FormControlLabel
                            key={option.id}
                            value={option.value}
                            control={<Radio size="small" />}
                            label={t(option.label)}
                            sx={{
                                mr: 0,
                                "& .MuiFormControlLabel-label": {
                                    fontWeight: 500,
                                },
                            }}
                        />
                    ))}
                </RadioGroup>

                <Button
                    variant="contained"
                    onClick={() => {
                        dispatch(resetContactsListPagination());
                        dispatch(fetchContacts());
                        dispatch(setAdvanceFiltersModalOpen(false));
                        dispatch(setAdvanceFiltersApplied(true));
                    }}
                    fullWidth
                    sx={{
                        backgroundColor: "common.mainBlue",
                        mt: 4,
                    }}
                    disabled={isFilterButtonDisabled}
                >
                    {t("filter")}
                </Button>
            </Box>
        </Dialog>
    );
}
