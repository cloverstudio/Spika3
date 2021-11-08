import React from "react";
import { useHistory } from "react-router-dom";
import {
    Avatar,
    Button,
    CssBaseline,
    TextField,
    FormControlLabel,
    Checkbox,
    Link,
    Grid,
    Box,
    Typography,
    Container,
} from "@mui/material";

import { LockOutlined } from "@mui/icons-material/";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useSelector, useDispatch } from "react-redux";
import dayjs from "dayjs";

import { RootState } from "../../store/store";
import { login, callAdminAuthApi } from "../../store/adminAuthSlice";
import { usePost } from "../../lib/useApi";
import SnackBar from "../../components/snackBar";
import { useShowSnackBar } from "../../components/useUI";

export default function () {
    const count = useSelector((state: RootState) => state.counter.value);
    const dispatch = useDispatch();
    const post = usePost();
    const showSnackBar = useShowSnackBar();

    let history = useHistory();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formdata: any = event.target;
        const username: string = formdata.username.value;
        const password: string = formdata.password.value;

        try {
            const loginResult: any = await post("/api/management/auth", {
                username: username,
                password: password,
            });

            if (loginResult.token) {
                dispatch(
                    login({
                        token: loginResult.token,
                        username: username,
                        expireDate: dayjs.unix(loginResult.expireDate).toDate(),
                    })
                );

                showSnackBar({ severity: "success", text: "Signed In" });

                history.push("/dashboard");
            } else {
                showSnackBar({ severity: "error", text: "Failed to signin" });
            }
        } catch (e) {
            showSnackBar({ severity: "error", text: "Failed to signin" });
        }
    };

    const theme = createTheme({
        palette: {
            mode: "light",
        },
    });

    return (
        <ThemeProvider theme={theme}>
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Box
                    sx={{
                        marginTop: 8,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                        <LockOutlined />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Spika3 Admin
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Admin User Name"
                            name="username"
                            autoComplete="username"
                            autoFocus
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Admin Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                        />
                        <FormControlLabel
                            control={<Checkbox value="remember" color="primary" />}
                            label="Remember me"
                        />
                        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                            Sign In
                        </Button>
                    </Box>
                </Box>

                <SnackBar />
            </Container>
        </ThemeProvider>
    );
}
