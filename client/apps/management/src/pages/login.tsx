import React, { useState } from "react";
import { Alert, AlertTitle, Box, Button, FormLabel, TextField } from "@mui/material";

import AuthLayout from "@/features/auth/AuthLayout";
import useStrings from "@/hooks/useStrings";
import { useAdminSignInMutation } from "@/features/auth/api/auth";
import * as Constants from "@lib/constants";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const strings = useStrings();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const [login, { isLoading }] = useAdminSignInMutation();

    const handleSubmit = async () => {
        try {
            const response = await login({ username, password }).unwrap();

            if (response.status === "success") {
                localStorage.setItem(Constants.ADMIN_ACCESS_TOKEN, response.data.token);
                setError("");
                navigate("/");
            } else {
                setError(response.message);
            }
        } catch (error) {
            setError("An error occurred");
        }
    };

    return (
        <AuthLayout>
            {error && (
                <Alert sx={{ mb: 4 }} severity="error">
                    <AlertTitle sx={{ mb: 0 }}>{error}</AlertTitle>
                </Alert>
            )}
            <Box textAlign="left" mb={{ xs: 3, md: 6 }}>
                <FormLabel sx={{ mb: 1, display: "block" }}>{strings.username}</FormLabel>
                <TextField
                    sx={{ mb: 2 }}
                    disabled={isLoading}
                    required
                    fullWidth
                    id="username"
                    name="username"
                    autoComplete="username"
                    autoFocus
                    value={username}
                    onChange={({ target }) => setUsername(target.value)}
                />

                <FormLabel sx={{ mb: 1, display: "block" }}>{strings.password}</FormLabel>
                <TextField
                    sx={{ mb: 3 }}
                    disabled={isLoading}
                    required
                    fullWidth
                    type="password"
                    id="password"
                    name="password"
                    autoComplete="password"
                    value={password}
                    onChange={({ target }) => setPassword(target.value)}
                    onKeyDown={({ key }) => {
                        if (key === "Enter") {
                            handleSubmit();
                        }
                    }}
                />

                <Button
                    onClick={handleSubmit}
                    disabled={username.length === 0 || password.length === 0 || isLoading}
                    fullWidth
                    variant="contained"
                >
                    {strings.login}
                </Button>
            </Box>
        </AuthLayout>
    );
}
