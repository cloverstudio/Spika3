import React from "react";
import { useHistory } from "react-router-dom";
import { Grid, Box, Stack, Paper, Container,TextField, Button, Link } from "@mui/material";
import image from '../../../../../../documents/pages/login_robot_image.svg';
import logo from '../../../../../../documents/pages/login_logo.svg';
import { createTheme, ThemeProvider, styled } from "@mui/material/styles";
import { height, textAlign } from "@mui/system";

const theme = createTheme({
  palette: {
    mode: "light",
  },
})

export default function () {
  return (
    <ThemeProvider theme={theme}>
      <Grid container>
        <Grid  item xs={12} md={6} lg={4}>
          <Stack justifyContent="center" alignItems="center" spacing={2} sx={{height: '100%'}}>
            <Box sx={{width: '80%',height: 200,display: { xs: 'block', md: 'none' } }}></Box>
            <Stack justifyContent="center" alignItems="center" spacing={2} direction="row">
              <img src={logo}/>
              <label> Spika </label>
            </Stack>
            <Box sx={{width: '80%',height: 5 }}></Box> 
            <Box> Welcome! </Box>
            <Box> Sign in to start using Spika! </Box>
            <TextField sx={{width: '80%', height:50}} id="outlined-basic" label="email or phone number" variant="outlined" />
            <Button sx={{width: '80%', height: 56}} variant="outlined">Next</Button>
            <Box><Link href="#" underline="none">{'New here? Create account'}</Link></Box>
          </Stack>
        </Grid>
        <Grid item md={6} lg={8} >
          <Box  sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'right'}}><img className="max-height" src={image}/></Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
