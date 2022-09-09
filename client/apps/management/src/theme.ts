import { createTheme, ThemeProvider } from "@mui/material/styles";

const spikaLightGray = "#dcdcdc";
const spikaPurpleGrey = "#282a40";
const spikaPurple = "#5b5fd8";
const spikaMainBackgroundColor = "#f5f5f5";
const spikaGrey = "#a0a0a0";

let theme = createTheme({
    typography: {
        fontFamily: `"Roboto" , sans-serif`,
        fontSize: 14,
        fontWeightLight: 300,
        fontWeightRegular: 400,
        fontWeightMedium: 500,
        fontWeightBold: 600,
    },

    palette: {
        spikaButton: {
            main: spikaPurple,
            contrastText: "#fff",
        },
        spikaLightGrey: {
            main: spikaLightGray,
            contrastText: "#fff",
        },
        spikaDrawer: {
            main: spikaPurpleGrey,
            contrastText: "#fff",
        },
        spikaMainBackgroundColor: {
            main: spikaMainBackgroundColor,
            contrastText: "#fff",
        },
        spikaGrey: {
            main: spikaGrey,
            contrastText: "#fff",
        },
    },
});

theme = createTheme(theme, {
    components: {
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.palette.spikaLightGrey.main,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.palette.spikaButton.main,
                    },

                    input: {
                        "&::placeholder": {
                            color: "grey",
                            fontWeight: theme.typography.fontWeightMedium,
                            opacity: "1",
                            fontFamily: theme.typography.fontFamily,
                        },
                        color: "grey",
                        fontWeight: theme.typography.fontWeightMedium,
                        "&:-webkit-autofill": {
                            WebkitBoxShadow: "0 0 0 100px #fff inset",
                            WebkitTextFillColor: "grey",
                        },
                    },
                },
            },
        },
        // MuiDrawer: {
        //     styleOverrides: {
        //         root: {
        //             "& 	.MuiDrawer-paper": {
        //                 backgroundColor: theme.palette.spikaDrawer.main,
        //             },
        //         },
        //     },
        // },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    "&.Mui-focused": {
                        color: theme.palette.spikaButton.main,
                    },
                },
            },
        },
    },
});

declare module "@mui/material/styles" {
    interface Palette {
        spikaButton: Palette["primary"];
        spikaLightGrey: Palette["primary"];
        spikaDrawer: Palette["primary"];
        spikaMainBackgroundColor: Palette["primary"];
        spikaGrey: Palette["primary"];
    }

    interface PaletteOptions {
        spikaButton?: PaletteOptions["primary"];
        spikaLightGrey?: PaletteOptions["primary"];
        spikaDrawer?: PaletteOptions["primary"];
        spikaMainBackgroundColor?: PaletteOptions["primary"];
        spikaGrey?: PaletteOptions["primary"];
    }
}
declare module "@mui/material/Button" {
    interface ButtonPropsColorOverrides {
        spikaButton: true;
        spikaLightGrey: true;
        spikaGrey: true;
    }
}
declare module "@mui/material/Checkbox" {
    interface CheckboxPropsColorOverrides {
        spikaButton: true;
    }
}

declare module "@mui/material/TextField" {
    interface TextFieldPropsColorOverrides {
        spikaButton: true;
    }
}

declare module "@mui/material/Typography" {
    interface TypographyPropsColorOverrides {
        spikaLightGrey: true;
    }
}

export default theme;
