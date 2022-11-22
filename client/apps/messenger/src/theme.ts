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
        darkBlue: string;
        confCallBackground: string;
        videoBackground: string;
        videoLabelBackground: string;
        confCallControls: string;
        confCallControlsHoverBackground: string;
        confCallFirstLetterColor: string;
    }
}


const basePalette: PaletteOptions = {
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
    }
}

const typography : TypographyVariantsOptions = {
    fontFamily: `"Roboto" , sans-serif`,
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    body1: {
        color: "#141414",
    },
};

const components : any =  {
    components: {
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
                        borderColor: basePalette.text.tertiary,
                    },
                    input: {
                        "&::placeholder": {
                            color: basePalette.text.tertiary,
                            fontWeight: typography.fontWeightMedium,
                            opacity: "1",
                        },
                        color: typography.body1.color,
                        fontWeight: typography.fontWeightMedium,
                    },
                    textarea: {
                        "&::placeholder": {
                            color: basePalette.text.tertiary,
                            fontWeight: typography.fontWeightMedium,
                            opacity: "1",
                        },
                        color: typography.body1.color,
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
                        color: typography.body1.color,
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
        },
        background: {
            default: "#fafafa"
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
        },
        background: {
            default: "#303030"
        },
        action: {
            disabled: "#fff",
            disabledBackground: "#a3cbf8",
            hover: "#E6F4FF",
        },
        text: {
            primary: "#fff",
            secondary: "rgba(255,255,255,0.7)",
            tertiary: "#9AA0A6",
            navigation: "#fff",
        },
    },
});


export type ThemeType = "light" | "dark";
export type ThemeContextType = { theme: ThemeType; setTheme: (theme: ThemeType) => void };

export const ThemeContext = React.createContext<ThemeContextType>(
    {} as ThemeContextType
);

