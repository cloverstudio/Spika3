import { createTheme, ThemeProvider } from "@mui/material/styles";

const spikaLightGray = "#dcdcdc";
const hoverColor = "#0000ff";
const spikaPurple = "#5b5fd8";

let theme = createTheme({
    typography: {
        fontFamily: `"Montserrat" , sans-serif`,
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
    },
});

theme = createTheme(theme, {
    components: {
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.palette.spikaLightGrey.main,
                        "&.Mui-focused": {
                            borderColor: theme.palette.spikaLightGrey.main,
                        },
                    },
                    input: {
                        "&::placeholder": {
                            color: theme.palette.spikaLightGrey.main,
                            fontWeight: theme.typography.fontWeightMedium,
                            opacity: "1",
                            fontFamily: theme.typography.fontFamily,
                        },
                        color: theme.palette.spikaLightGrey.main,
                        fontWeight: theme.typography.fontWeightMedium,
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
    }

    interface PaletteOptions {
        spikaButton?: PaletteOptions["primary"];
        spikaLightGrey?: PaletteOptions["primary"];
    }
}
declare module "@mui/material/Button" {
    interface ButtonPropsColorOverrides {
        spikaButton: true;
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

export default theme;
