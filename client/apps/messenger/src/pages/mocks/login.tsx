import React from "react";
import { Grid, Box, Stack, TextField, Button, Link } from "@mui/material";
import image from "../../../../../../documents/pages/login_robot_image.svg";
import logo from "../../../../../../documents/pages/login_logo.svg";
import { createTheme, ThemeProvider, styled } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        mode: "light",
    },
});

export default function () {
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
                        <TextField
                            sx={{ width: "80%", height: 50 }}
                            id="outlined-basic"
                            label="email or phone number"
                            variant="outlined"
                        />
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
