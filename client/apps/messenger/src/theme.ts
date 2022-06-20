import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
    interface TypeText {
        primary: string;
        secondary: string;
        disabled: string;
        tertiary: string;
        navigation: string;
    }
}

declare module "@mui/material/styles/createPalette" {
    interface CommonColors {
        black: string;
        white: string;
        chatBackground: string;
        myMessageBackground: string;
        darkBlue: string;
        confCallBackground: string;
        videoBackground: string;
        videoLabelBackground: string;
        confCallControls: string;
        confCallControlsHoverBackground: string;
        confCallFirstLetterColor: string;
    }
}

let theme = createTheme({
    typography: {
        fontFamily: `"Montserrat" , sans-serif`,
        fontSize: 14,
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
            hover: "#E6F4FF",
        },
        text: {
            primary: "#141414",
            secondary: "#4A4A4A",
            tertiary: "#9AA0A6",
            navigation: "#9BB4CF",
        },
        common: {
            darkBlue: "#131940",
            chatBackground: "#F2F2F2",
            myMessageBackground: "#C8EBFE",
            videoBackground: "#222",
            videoLabelBackground: "#fff9",
            confCallControls: "#fff",
            confCallControlsHoverBackground: "#fff1",
            confCallBackground: "#111111f4",
            confCallFirstLetterColor: "#fff",
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
                    fontWeight: theme.typography.fontWeightBold,
                },
            },
        },
        MuiFormLabel: {
            styleOverrides: {
                root: {
                    color: theme.palette.text.tertiary,
                    fontWeight: theme.typography.fontWeightMedium,
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    "& .MuiOutlinedInput-notchedOutline": {
                        borderRadius: "0.625rem",
                        borderColor: theme.palette.text.tertiary,
                    },
                    input: {
                        "&::placeholder": {
                            color: theme.palette.text.tertiary,
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
                            color: theme.palette.text.tertiary,
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
                    fontWeight: theme.typography.fontWeightBold,
                    color: "#ef5350",
                },
            },
        },
    },
});

export default theme;
