import React from "react";
import { Grid, Box, Stack, Button, Link } from "@mui/material";
import image from "../../../../../../documents/pages/login_robot_image.svg";
import logo from "../../../../../../documents/pages/login_logo.svg";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CountryType } from "./countries";
import * as defaults from "./countries";
import CountryPicker from "./countryPicker";

const theme = createTheme({
    palette: {
        mode: "light",
    },
});

export default function () {
    const countries: CountryType[] = defaults.countries;
    const [inputValue, setInputValue] = React.useState("");

    return (
        <ThemeProvider theme={theme}>
            <Grid container>
                <Grid item xs={12} md={6} lg={4} pl="4em" pt="6em">
                    <Stack justifyContent="start" alignItems="start" spacing={2}>
                        <Stack
                            justifyContent="start"
                            alignItems="start"
                            spacing={2}
                            direction="row"
                        >
                            <Box
                                component="img"
                                width="3rem"
                                height="3rem"
                                display="flex"
                                flexDirection="column"
                                justifyContent="center"
                                src={logo}
                            ></Box>
                            <Box lineHeight="3rem" fontWeight="700" fontSize="1.4rem">
                                <label> Spika </label>
                            </Box>
                        </Stack>
                        <Box padding="1em 0 0 0" fontWeight="700" fontSize="2.4rem">
                            Welcome!!
                        </Box>
                        <Box pb="3.8em"> Sign in to start using Spika! </Box>
                        <Stack
                            justifyContent="start"
                            alignItems="start"
                            spacing={2}
                            direction="row"
                            width="80%"
                        >
                            <CountryPicker />
                            {/* <Autocomplete
                                id="country-select-demo"
                                sx={{ width: 150 }}
                                options={countries}
                                autoHighlight
                                getOptionLabel={(option) => option.label}
                                renderOption={(props, option) => (
                                    <Box
                                        component="li"
                                        sx={{ "& > img": { mr: 2, flexShrink: 0 }, fontSize: 12 }}
                                        {...props}
                                    >
                                        <img
                                            loading="lazy"
                                            width="20"
                                            src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                                            srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
                                            alt=""
                                        />
                                        (+{option.phone}) {option.label}
                                    </Box>
                                )}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Country"
                                        inputProps={{
                                            ...params.inputProps,
                                            autoComplete: "new-password",
                                            style: { fontSize: 12 },
                                        }}
                                        InputLabelProps={{ style: { fontSize: 12 } }}
                                    />
                                )}
                            /> */}
                            {/* <TextField
                                sx={{ width: "80%", height: 50 }}
                                id="outlined-basic"
                                label="email or phone number"
                                variant="outlined"
                            /> */}
                        </Stack>
                        <Button sx={{ width: "80%", height: 56 }} variant="outlined">
                            Next
                        </Button>
                        <Box pt="2em">
                            <Link href="#" underline="none">
                                {"New here? Create account"}
                            </Link>
                        </Box>
                    </Stack>
                </Grid>
                <Grid
                    item
                    md={6}
                    lg={8}
                    display="flex"
                    alignContent="flex-end"
                    justifyContent="flex-end"
                >
                    <Box component="img" height="100vh" src={image}></Box>
                </Grid>
            </Grid>
        </ThemeProvider>
    );
}
