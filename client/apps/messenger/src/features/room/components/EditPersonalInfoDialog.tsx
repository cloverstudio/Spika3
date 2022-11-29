import React, { useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormLabel,
    TextField,
    IconButton,
} from "@mui/material";

import { useUpdateMutation } from "../../auth/api/auth";

import UserType, { UpdateUserFormType } from "../../../types/User";
import useStrings from "../../../hooks/useStrings";
import CountryAutocompletePicker from "../../../components/CountryAutocompletePicker";
import CityAutocompletePicker from "../../../components/CityAutocompletePicker";
import { Close } from "@mui/icons-material";

export interface EditPersonalInfoDialogProps {
    onClose: () => void;
    user: UserType;
}

export default function EditPersonalInfoDialog({ onClose, user }: EditPersonalInfoDialogProps) {
    const strings = useStrings();
    const [updateUser] = useUpdateMutation();

    const [form, setForm] = useState<UpdateUserFormType>({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        country: user.country || "",
        city: user.city || "",
        dob: new Date(user.dob).toISOString().split("T")[0] || "",
        gender: user.gender || "male",
        email: user.emailAddress || "",
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await updateUser({ ...user, ...form, dob: +new Date(form.dob) }).unwrap();
        onClose();
    };

    const handleChange = (key, value) => {
        const newForm = { ...form, [key]: value };

        if (key === "country") {
            newForm.city = "";
        }

        setForm(newForm);
    };

    return (
        <Dialog onClose={onClose} open={true} maxWidth="lg">
            <DialogTitle sx={{ textAlign: "center" }}>{strings.personalInformation}</DialogTitle>
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
            <Box textAlign="left" component="form" p={4} onSubmit={(e) => handleSubmit(e)}>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                        gap: 2,
                    }}
                    mb={4}
                >
                    <Box>
                        <FormLabel sx={{ mb: 1, display: "block" }}>{strings.firstName}</FormLabel>
                        <TextField
                            required
                            fullWidth
                            id="firstName"
                            placeholder={strings.enter}
                            name="firstName"
                            autoComplete="firstName"
                            autoFocus
                            value={form.firstName}
                            onChange={({ target }) => handleChange("firstName", target.value)}
                        />
                    </Box>

                    <Box>
                        <FormLabel sx={{ mb: 1, display: "block" }}>{strings.lastName}</FormLabel>
                        <TextField
                            required
                            fullWidth
                            id="lastName"
                            placeholder={strings.enter}
                            name="lastName"
                            autoComplete="lastName"
                            value={form.lastName}
                            onChange={({ target }) => handleChange("lastName", target.value)}
                        />
                    </Box>

                    <Box>
                        <FormLabel sx={{ mb: 1, display: "block" }}>{strings.gender}</FormLabel>

                        <RadioGroup
                            id="gender"
                            value={form.gender}
                            onChange={({ target }) => handleChange("gender", target.value)}
                            row
                        >
                            <FormControlLabel
                                value="male"
                                control={<Radio />}
                                label={strings.male}
                            />
                            <FormControlLabel
                                value="female"
                                control={<Radio />}
                                label={strings.female}
                            />
                            <FormControlLabel
                                value="other"
                                control={<Radio />}
                                label={strings.other}
                            />
                        </RadioGroup>
                    </Box>

                    <Box>
                        <FormLabel sx={{ mb: 1, display: "block" }}>{strings.dob}</FormLabel>
                        <TextField
                            required
                            fullWidth
                            id="dob"
                            placeholder={strings.ddmmyy}
                            name="dob"
                            autoComplete="dob"
                            value={form.dob}
                            type="date"
                            onChange={({ target }) => handleChange("dob", target.value)}
                        />
                    </Box>

                    <Box>
                        <FormLabel sx={{ mb: 1, display: "block" }}>{strings.email}</FormLabel>
                        <TextField
                            required
                            fullWidth
                            id="email"
                            placeholder={strings.enter}
                            name="email"
                            autoComplete="email"
                            value={form.email}
                            type="email"
                            onChange={({ target }) => handleChange("email", target.value)}
                        />
                    </Box>

                    <CountryAutocompletePicker
                        value={form.country}
                        onChange={(v) => handleChange("country", v)}
                    />

                    {form.country && (
                        <CityAutocompletePicker
                            country={form.country}
                            value={form.city}
                            onChange={(v) => handleChange("city", v)}
                        />
                    )}
                </Box>
                <Button type="submit" variant="contained">
                    {strings.save}
                </Button>
            </Box>
        </Dialog>
    );
}
