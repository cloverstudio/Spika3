import React from "react";
import { Grid, Box, Stack, Paper, Container,TextField, Button, Link, Divider } from "@mui/material";
import logo from '../../../../../../documents/pages/login_logo.svg';
import { createTheme, ThemeProvider, styled } from "@mui/material/styles";
import { height, textAlign } from "@mui/system";
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import PublicIcon from '@mui/icons-material/Public';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import PeopleOutlineOutlinedIcon from '@mui/icons-material/PeopleOutlineOutlined';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { relative } from "path/posix";

const theme = createTheme({
  palette: {
    mode: "light",
  },
})

const ChatRecentsPage = () => {
    return (
        <ThemeProvider theme={theme}>
            <Box sx ={{height:20}}></Box>
            <Stack alignItems="center" spacing={2} direction="row" width='100%'>
                <img className = 'logo-chat' src={logo}/>
                <label className = 'logo-chat'> Spika </label>
                <IconButton>
                    <AccountCircleRoundedIcon />
                </IconButton>
            </Stack>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', borderRadius: 10, width: '90%', marginTop:2,}}>
                <SearchIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                <TextField label="Search for contact, message, file ..." sx={{ width:'90%', fontSize:12}} 
                    inputProps={{style: {fontSize: 12}}} 
                    InputLabelProps={{style: {fontSize: 12}}} />
            </Box>
            <Box sx ={{height:20}}></Box>
            <Stack alignItems="center" spacing={1} direction="row" className = "chat-control" sx={{borderRadius: 1,}} >
                <IconButton>
                    <PublicIcon />
                </IconButton>
                <IconButton>
                    <PersonOutlineOutlinedIcon />
                </IconButton>
                <IconButton >
                    <PeopleOutlineOutlinedIcon />
                </IconButton>
                <IconButton style={{textAlign:'right'}} >
                    <Stack alignItems="center" spacing={1} direction="row" className = "chat-new" sx={{borderRadius: 1, padding:1}} >
                        <label style={{fontSize: 14, color: "white"}}> NEW </label>
                        <AddBoxIcon style={{fill: "white"}}/>
                    </Stack>
                </IconButton>
            </Stack>
        </ThemeProvider>
      )
};

export default ChatRecentsPage;