import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Avatar,
    Button,
    CssBaseline,
    TextField,
    FormControlLabel,
    Checkbox,
    Box,
    Typography,
    Container,
} from "@mui/material";

import { LockOutlined } from "@mui/icons-material/";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useSelector, useDispatch } from "react-redux";
import dayjs from "dayjs";

import { RootState } from "../../store/store";
import { login } from "../../store/adminAuthSlice";
import SnackBar from "../../components/snackBar";
import { useShowSnackBar } from "../../components/useUI";
import { useCheckAccessTokenQuery, useAdminSigninMutation } from "../../api/auth";
import * as constants from "../../../../../lib/constants";

export default function () {
    const count = useSelector((state: RootState) => state.counter.value);
    const dispatch = useDispatch();
    const showSnackBar = useShowSnackBar();

    const navigate = useNavigate();

    const [rememberMe, setRememberMe] = React.useState(true);
    const { data } = useCheckAccessTokenQuery();
    const [adminSignIn, adminSignInMutation] = useAdminSigninMutation();

    useEffect(() => {
        (async () => {
            if (rememberMe) {
                await checkToken();
            }
        })();
    }, []);

    const checkToken = async () => {
        try {
            const response: string = data;
            const check: boolean = JSON.parse(response);
            const authToken = localStorage.getItem(constants.ADMIN_ACCESS_TOKEN);
            if (check && authToken != null && authToken.length != 0) {
                navigate("/dashboard");
            }
        } catch (e) {
            showSnackBar({ severity: "error", text: "Token expired" });
        }
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRememberMe(event.target.checked);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formdata: any = event.target;
        const username: string = formdata.username.value;
        const password: string = formdata.password.value;
        try {
            const loginResult: any = await adminSignIn({ username: username, password: password });
            if (loginResult.data.token) {
                if (rememberMe) {
                    localStorage.setItem(constants.ADMIN_ACCESS_TOKEN, loginResult.data.token);
                }
                dispatch(
                    login({
                        token: loginResult.data.token,
                        username: username,
                        expireDate: dayjs.unix(loginResult.data.expireDate).unix(),
                    })
                );

                showSnackBar({ severity: "success", text: "Signed In" });

                navigate("/dashboard");
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
                            control={<Checkbox checked={rememberMe} onChange={handleChange} />}
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
