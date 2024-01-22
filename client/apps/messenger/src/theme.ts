import React from "react";
import { PaletteOptions, TypographyVariantsOptions } from "@mui/material/styles";
import { createTheme } from "@mui/material";

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
        confCallBackground: string;
        videoBackground: string;
        videoLabelBackground: string;
        confCallControls: string;
        confCallControlsHoverBackground: string;
        confCallFirstLetterColor: string;
        disabledBackground: string;
        linkThumbnail: {
            sent: string;
            received: string;
        };
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
    },
    text: {
        tertiary: "#9AA0A6",
    },
};

const typography: TypographyVariantsOptions = {
    fontFamily: `"Montserrat" , sans-serif`,
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
};

const components: any = {
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
    MuiDialog: {
        styleOverrides: {
            paper: {
                borderRadius: "1rem",
            },
        },
    },
    MuiMenu: {
        styleOverrides: {
            root: {
                ".MuiMenu-paper": {
                    borderRadius: "10px",
                },
                ".MuiMenu-list": {
                    padding: "1rem 0",
                },
            },
        },
    },
};

export const lightTheme = createTheme({
    components: {
        ...components,
        ...{
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        "*::-webkit-scrollbar": {
                            width: "4px",
                            height: "4px",
                        },
                        "*::-webkit-scrollbar-thumb": {
                            background: "#888",
                            borderRadius: "4px",
                        },
                        "*::-webkit-scrollbar-track": {
                            background: "transparent",
                        },
                    },
                },
            },
        },
    },
    typography,
    palette: {
        ...basePalette,
        mode: "light",
        primary: {
            main: "#4696F0",
            light: "#f2f2f2",
            dark: "#4696F0",
            contrastText: "#f2f2f2",
        },
        background: {
            default: "#fff",
            paper: "#F2F2F2",
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
            otherMessageBackground: "#F2F2F2",
            disabledBackground: "rgba(256,256,256,0.65)",
            linkThumbnail: { sent: "#AFDFF9", received: "#E3E3E3" },
        },
    },
});

export const darkTheme = createTheme({
    components: {
        ...components,
        ...{
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        "*::-webkit-scrollbar": {
                            width: "4px",
                            height: "4px",
                        },
                        "*::-webkit-scrollbar-thumb": {
                            background: "#888",
                            borderRadius: "4px",
                        },
                        "*::-webkit-scrollbar-track": {
                            background: "transparent",
                        },
                    },
                },
            },
        },
    },
    typography,
    palette: {
        ...basePalette,
        mode: "dark",
        primary: {
            main: "#0078FF",
        },
        background: {
            default: "#202020",
            paper: "#3D3D3D",
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
            otherMessageBackground: "#3D3D3D",
            myMessageBackground: "#0078FF",
            disabledBackground: "rgba(0,0,0,0.65)",
            linkThumbnail: { sent: "#086FE2", received: "#2F2F2F" },
        },
    },
});

export type ThemeType = "light" | "dark";
export type ThemeContextType = { theme: ThemeType; setTheme: (theme: ThemeType) => void };

export const ThemeContext = React.createContext<ThemeContextType>({} as ThemeContextType);
