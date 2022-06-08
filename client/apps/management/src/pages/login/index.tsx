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
    Stack,
    Grid,
    FormControl,
    InputLabel,
    OutlinedInput,
    InputAdornment,
    IconButton,
} from "@mui/material";

import { LockOutlined } from "@mui/icons-material/";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useSelector, useDispatch } from "react-redux";
import dayjs from "dayjs";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import { RootState } from "../../store/store";
import { login } from "../../store/adminAuthSlice";
import SnackBar from "../../components/snackBar";
import { useShowSnackBar } from "../../components/useUI";
import { useCheckAccessTokenQuery, useAdminSigninMutation } from "../../api/auth";
import * as constants from "../../../../../lib/constants";
import loginBg from "../../assets/login-bg.svg";

export default function () {
    const count = useSelector((state: RootState) => state.counter.value);
    const dispatch = useDispatch();
    const showSnackBar = useShowSnackBar();

    const navigate = useNavigate();

    const [rememberMe, setRememberMe] = React.useState(true);
    const { data } = useCheckAccessTokenQuery();
    const [adminSignIn, adminSignInMutation] = useAdminSigninMutation();

    const [showPassword, setShowPassword] = React.useState(false);

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

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
        // <ThemeProvider theme={theme}>
        //     <Container component="main" maxWidth="xs">
        //         <CssBaseline />
        <Stack direction="row" width="100%">
            <Box width="70%">
                <Box
                    component="img"
                    sx={{
                        height: "100%",
                        width: "100%",
                    }}
                    alt="Img"
                    src={loginBg}
                />
                {/* <img  src={loginBg}></img> */}
            </Box>
            <Grid
                container
                spacing={0}
                direction="column"
                alignItems="center"
                justifyContent="center"
                style={{ minHeight: "100vh" }}
                width="30%"
            >
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ m: 3 }}>
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
                    <FormControl fullWidth required variant="outlined">
                        <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                        <OutlinedInput
                            id="outlined-adornment-password"
                            type={showPassword ? "text" : "password"}
                            onChange={handleClickShowPassword}
                            name="password"
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleClickShowPassword}
                                        onMouseDown={handleMouseDownPassword}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            }
                            label="Password"
                        />
                    </FormControl>
                    <FormControlLabel
                        control={<Checkbox checked={rememberMe} onChange={handleChange} />}
                        label="Remember me"
                    />
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                        Sign In
                    </Button>
                </Box>
            </Grid>
        </Stack>

        //         <SnackBar />
        //     </Container>
        // </ThemeProvider>
    );
}
