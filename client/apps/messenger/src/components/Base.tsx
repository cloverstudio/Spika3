import React, { createContext, useEffect } from "react";
import { CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useGetUserQuery } from "../api/auth";
import { useNavigate } from "react-router-dom";
import Loader from "./Loader";

import { requestForToken } from "../firebaseInit";
import { useGetDeviceQuery, useUpdateDeviceMutation } from "../api/device";

let theme = createTheme({
    typography: {
        fontFamily: `"Montserrat" , sans-serif`,
        fontSize: 12,
        fontWeightLight: 300,
        fontWeightRegular: 400,
        fontWeightMedium: 500,
        fontWeightBold: 600,
        body1: {
            color: "#141414",
        },
    },
    palette: {
        primary: {
            main: "#4696F0",
        },
        mode: "light",
        action: {
            disabled: "#fff",
            disabledBackground: "#a3cbf8",
        },
    },
});

theme = createTheme(theme, {
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    padding: "16px 24px",
                    borderRadius: "10px",
                    boxShadow: "none",
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: theme.typography.fontWeightBold,
                },
            },
        },
        MuiFormLabel: {
            styleOverrides: {
                root: {
                    color: "#9AA0A6",
                    fontWeight: theme.typography.fontWeightMedium,
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    "& .MuiOutlinedInput-notchedOutline": {
                        borderRadius: "10px",
                        borderColor: "#9AA0A6",
                    },
                    input: {
                        "&::placeholder": {
                            color: "#9AA0A6",
                            fontWeight: theme.typography.fontWeightMedium,
                            opacity: "1",
                        },
                        color: theme.typography.body1.color,
                        fontWeight: theme.typography.fontWeightMedium,
                    },
                },
            },
        },
        MuiInput: {
            styleOverrides: {
                root: {
                    borderRadius: "10px",
                    input: {
                        "&::placeholder": {
                            color: "#9AA0A6",
                            fontWeight: theme.typography.fontWeightMedium,
                            opacity: "1",
                        },
                        color: theme.typography.body1.color,
                        fontWeight: theme.typography.fontWeightMedium,
                    },
                },
            },
        },
        MuiAlertTitle: {
            styleOverrides: {
                root: {
                    fontSize: "1rem",
                    fontWeight: theme.typography.fontWeightBold,
                    color: "#ef5350",
                },
            },
        },
    },
});

type Props = {
    children?: React.ReactNode;
};

export const AuthContext = createContext({ user: null });

export default function AuthBase({ children }: Props): React.ReactElement {
    const { data: user, isFetching } = useGetUserQuery();
    const device = useGetDeviceQuery();
    const [updateDevice] = useUpdateDeviceMutation();
    const navigate = useNavigate();

    const hasPushToken = device.data && device.data.pushToken;

    useEffect(() => {
        if (!isFetching && !user) {
            navigate("/");
        }
    }, [user, isFetching, navigate]);

    useEffect(() => {
        if (!hasPushToken) {
            requestForToken(updateDevice);
        }
    }, [hasPushToken, updateDevice]);

    if (isFetching) {
        return <Loader />;
    }

    return (
        <AuthContext.Provider value={{ user }}>
            <Base>{children}</Base>
        </AuthContext.Provider>
    );
}

export function Base({ children }: Props): React.ReactElement {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />

            {children}
        </ThemeProvider>
    );
}
