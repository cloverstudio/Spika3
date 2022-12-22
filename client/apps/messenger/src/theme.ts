import React, { useEffect, useState } from "react";
import { createTheme, PaletteOptions, TypographyVariantsOptions } from "@mui/material/styles";

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
        otherMessageBackground: string;
        darkBlue: string;
        confCallControlsLobby: string;
        confCallControls: string;
    }
}

const basePalette: PaletteOptions = {
    common: {
        darkBlue: "#131940",
        chatBackground: "#F2F2F2",
        myMessageBackground: "#C8EBFE",
        confCallControls: "#4696F0",
        confCallControlsLobby: "#4696F0",
    },
    text: {
        tertiary: "#9AA0A6",
    },
};

const typography: TypographyVariantsOptions = {
    fontFamily: `"Roboto" , sans-serif`,
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
};

const components: any = {
    components: {
        MuiButtonBase: {
            defaultProps: {
                disableRipple: true,
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    padding: "16px 24px",
                    borderRadius: "0.625rem",
                    boxShadow: "none",
                    textTransform: "none",
                    fontWeight: typography.fontWeightBold,
                },
            },
        },
        MuiFormLabel: {
            styleOverrides: {
                root: {
                    color: basePalette.text.tertiary,
                    fontWeight: typography.fontWeightMedium,
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    "& .MuiOutlinedInput-notchedOutline": {
                        borderRadius: "0.625rem",
                        borderColor: "divider",
                    },
                    input: {
                        "&::placeholder": {
                            color: basePalette.text.tertiary,
                            fontWeight: typography.fontWeightMedium,
                            opacity: "1",
                        },
                        fontWeight: typography.fontWeightMedium,
                    },
                    textarea: {
                        "&::placeholder": {
                            color: basePalette.text.tertiary,
                            fontWeight: typography.fontWeightMedium,
                            opacity: "1",
                        },
                        fontWeight: typography.fontWeightMedium,
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
                            color: basePalette.text.tertiary,
                            fontWeight: typography.fontWeightMedium,
                            opacity: "1",
                        },
                        fontWeight: typography.fontWeightMedium,
                    },
                },
            },
        },
        MuiAlertTitle: {
            styleOverrides: {
                root: {
                    fontWeight: typography.fontWeightBold,
                    color: "#ef5350",
                },
            },
        },
        MuiDataGrid: {
            styleOverrides: {
                root: {
                    "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: "red",
                        color: "rgba(255,0,0,0.7)",
                        fontSize: 40,
                    },
                },
            },
        },
    },
};

export const lightTheme = createTheme({
    components: components,
    typography: typography,
    palette: {
        ...basePalette,
        mode: "light",
        primary: {
            main: "#4696F0",
            light: "#69A3E6",
            dark: "#3169A8",
            contrastText: "#f2f2f2",
        },
        secondary: {
            main: "#F04675",
            light: "#F36B90",
            dark: "#A83151",
            contrastText: "#f2f2f2",
        },
        background: {
            default: "#fff",
            paper: "#f0f0f0",
        },
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
            myMessageBackground: "#C8EBFE",
            otherMessageBackground: "#f0f0f0",
            confCallControls: "#f0f0f0",
            confCallControlsLobby: "#4696F0",
        },
    },
});

export const darkTheme = createTheme({
    components: components,
    typography: typography,
    palette: {
        ...basePalette,
        mode: "dark",
        primary: {
            main: "#4696F0",
            light: "#69A3E6",
            dark: "#3169A8",
            contrastText: "#f2f2f2",
        },
        secondary: {
            main: "#F04675",
            light: "#F36B90",
            dark: "#A83151",
            contrastText: "#f2f2f2",
        },
        background: {
            default: "#202020",
            paper: "#404040",
        },
        action: {
            disabled: "#222",
            disabledBackground: "#323E4C",
            hover: "#414549",
        },
        text: {
            primary: "#fff",
            secondary: "rgba(255,255,255,0.7)",
            tertiary: "#9AA0A6",
            navigation: "#fff",
        },
        common: {
            otherMessageBackground: "#303030",
            myMessageBackground: "#303040",
            confCallControls: "#fff",
            confCallControlsLobby: "#4696F0",
        },
    },
});

export type ThemeType = "light" | "dark";
export type ThemeContextType = { theme: ThemeType; setTheme: (theme: ThemeType) => void };

export const ThemeContext = React.createContext<ThemeContextType>({} as ThemeContextType);
