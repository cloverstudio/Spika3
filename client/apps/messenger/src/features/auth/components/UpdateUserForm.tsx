import React, { useState } from "react";
import { Button, TextField, FormLabel, Box, Alert, AlertTitle } from "@mui/material";

import uploadImage from "../../../assets/upload-image.svg";

type UpdateUserFormProps = {
    onSubmit: (username: string) => void;
    error?: any;
};

export default function UpdateUserForm({
    onSubmit,
    error,
}: UpdateUserFormProps): React.ReactElement {
    const [username, setUsername] = useState("");

    return (
        <>
            <Box minWidth="320px" textAlign="center" mb={error ? 2 : 7}>
                <img src={uploadImage} />
            </Box>
            {error && (
                <Alert sx={{ mb: 4 }} severity="error">
                    <AlertTitle sx={{ mb: 0 }}>{error.message}</AlertTitle>
                </Alert>
            )}
            <Box textAlign="left" mb={{ xs: 3, md: 6 }}>
                <FormLabel sx={{ mb: 1.5, display: "block" }}>Username</FormLabel>
                <TextField
                    sx={{ mb: 3 }}
                    required
                    fullWidth
                    id="username"
                    placeholder="Enter"
                    name="username"
                    autoComplete="username"
                    autoFocus
                    value={username}
                    onChange={({ target }) => setUsername(target.value)}
                />
                <Button
                    onClick={() => onSubmit(username)}
                    disabled={username.length === 0}
                    fullWidth
                    variant="contained"
                >
                    Next
                </Button>
            </Box>
        </>
    );
}
