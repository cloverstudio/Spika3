import React, { useState } from "react";
import { Button, TextField, FormLabel, Box, Typography } from "@mui/material";

import uploadImage from "../assets/upload-image.svg";

type UsernameFormProps = {
    onSubmit: (username: string) => void;
};

export default function UsernameForm({ onSubmit }: UsernameFormProps): React.ReactElement {
    const [username, setUsername] = useState("");

    return (
        <>
            <Box minWidth="320px" textAlign="center" mb={7}>
                <img src={uploadImage} />
            </Box>

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
