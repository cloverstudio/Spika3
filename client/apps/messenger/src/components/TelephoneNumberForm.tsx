import React, { useState } from "react";
import { Button, TextField, FormLabel, Box, Typography } from "@mui/material";

type TelephoneNumberFormProps = {
    onSubmit: (telephoneNumber: string) => void;
};

export default function TelephoneNumberForm({
    onSubmit,
}: TelephoneNumberFormProps): React.ReactElement {
    const [telephoneNumber, setTelephoneNumber] = useState("");

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
                <TextField
                    sx={{ mb: 3 }}
                    required
                    fullWidth
                    id="telephone"
                    placeholder="Eg. 98726546"
                    name="telephoneNumber"
                    autoComplete="telephone"
                    autoFocus
                    value={telephoneNumber}
                    onChange={({ target }) => setTelephoneNumber(target.value)}
                />
                <Button
                    onClick={() => onSubmit(telephoneNumber)}
                    disabled={telephoneNumber.length === 0}
                    fullWidth
                    variant="contained"
                >
                    Next
                </Button>
            </Box>
        </>
    );
}
