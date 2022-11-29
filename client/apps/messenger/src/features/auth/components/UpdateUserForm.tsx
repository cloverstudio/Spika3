import React, { useState } from "react";
import {
    Button,
    TextField,
    FormLabel,
    Box,
    Alert,
    AlertTitle,
    Stack,
    RadioGroup,
    Radio,
    FormControlLabel,
} from "@mui/material";

import uploadImage from "../../../assets/upload-image.svg";
import useStrings from "../../../hooks/useStrings";
import { UpdateUserFormType } from "../../../types/User";
import CountryAutocompletePicker from "../../../components/CountryAutocompletePicker";
import CityAutocompletePicker from "../../../components/CityAutocompletePicker";

type UpdateUserFormProps = {
    onSubmit: ({
        file,
        firstName,
        lastName,
        dob,
        city,
        country,
        gender,
    }: {
        file: File;
        firstName: string;
        lastName: string;
        country: string;
        gender: string;
        city: string;
        email: string;
        dob: number;
    }) => void;
    error?: any;
    initialCountry?: string;
};

export default function UpdateUserForm({
    onSubmit,
    error,
    initialCountry,
}: UpdateUserFormProps): React.ReactElement {
    const strings = useStrings();
    const [form, setForm] = useState<UpdateUserFormType>({
        firstName: "",
        lastName: "",
        country: initialCountry || "",
        city: "",
        dob: "",
        gender: "male",
        email: "",
    });
    const [file, setFile] = useState<File>();
    const uploadFileRef = React.useRef(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = e.target.files && e.target.files[0];

        setFile(uploadedFile);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit({ ...form, file, dob: +new Date(form.dob) });
    };

    const handleChange = (key, value) => {
        const newForm = { ...form, [key]: value };

        if (key === "country") {
            newForm.city = "";
        }

        setForm(newForm);
    };

    return (
        <>
            <Box minWidth="310px" textAlign="center" mb={error ? 2 : 4}>
                <img
                    width="100px"
                    height="100px"
                    style={{ objectFit: "cover", borderRadius: "50%" }}
                    src={file ? URL.createObjectURL(file) : uploadImage}
                    onClick={() => uploadFileRef.current?.click()}
                />
                <input
                    onChange={handleFileUpload}
                    type="file"
                    style={{ display: "none" }}
                    ref={uploadFileRef}
                    accept="image/*"
                />
            </Box>
            {error && (
                <Alert sx={{ mb: 2 }} severity="error">
                    <AlertTitle sx={{ mb: 0 }}>{error.message}</AlertTitle>
                </Alert>
            )}
            <Box
                textAlign="left"
                mb={{ xs: 3, md: 6 }}
                component="form"
                onSubmit={(e) => handleSubmit(e)}
            >
                <Stack spacing={2} mb={4}>
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
                </Stack>
                <Button type="submit" fullWidth variant="contained">
                    {strings.next}
                </Button>
            </Box>
        </>
    );
}
