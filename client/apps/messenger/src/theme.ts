import { createTheme } from "@mui/material/styles";

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
                    borderRadius: "0.625rem",
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
                        borderRadius: "0.625rem",
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
                    borderRadius: "0.625rem",
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

export default theme;
