import React, { useState } from "react";
import { Button, TextField, FormLabel, Box, Typography, Alert, AlertTitle } from "@mui/material";
import CountryPicker from "./CountryPicker";

type TelephoneNumberFormProps = {
    onSubmit: (telephoneNumber: string) => void;
};

export default function TelephoneNumberForm({
    onSubmit,
}: TelephoneNumberFormProps): React.ReactElement {
    const [countryCode, setCountryCode] = React.useState<string>("1");
    const [phoneNumber, setPhoneNumber] = React.useState<string>("");
    const [validPhoneNumber, setValidPhoneNumber] = React.useState<boolean>(false);

    const handleSubmit = () => {
        const formattedPhoneNumber = phoneNumber.startsWith("0")
            ? phoneNumber.substring(1)
            : phoneNumber;

        onSubmit(`+${countryCode}${formattedPhoneNumber}`);
    };

    return (
        <>
            <Typography
                display={{ xs: "none", md: "block" }}
                mb={3}
                component="h1"
                variant="h3"
                fontWeight="bold"
            >
                Welcome!
            </Typography>

            <Typography
                component="p"
                variant="body1"
                mx={{ xs: "auto", md: 0 }}
                maxWidth={{ xs: "220px", md: "none" }}
                mb={{ xs: 5, md: 10 }}
                fontWeight="medium"
            >
                Enter your phone number to start using Spika
            </Typography>

            <Box textAlign="left" mb={{ xs: 3, md: 6 }}>
                <FormLabel sx={{ mb: 1.5, display: "block" }}>Phone number</FormLabel>
                <CountryPicker
                    code={setCountryCode}
                    setPhoneNumber={setPhoneNumber}
                    phoneNumber={phoneNumber}
                    validation={setValidPhoneNumber}
                />
                <Button
                    onClick={handleSubmit}
                    disabled={!validPhoneNumber}
                    fullWidth
                    variant="contained"
                    sx={{ marginTop: "1em" }}
                >
                    Next
                </Button>
            </Box>
        </>
    );
}
