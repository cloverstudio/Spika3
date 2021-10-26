import * as React from 'react';
import ChatDetailsSidebar from './chatDetailsSidebar';
import ChatInputBar from './chatInputBar';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const drawerWidth = 400;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
    open?: boolean;
  }>(({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginRight: -drawerWidth,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginRight: 0,
    }),
  }));

  const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-start',
  }));

  const theme = createTheme({
    palette: {
      mode: "light",
    },
  })

const MainChatView = (props: { open: boolean; handleDrawerClose: any}) => {
    
    const [open, setOpen] = React.useState(false);
    return (
        <ThemeProvider theme={theme}>
            <Main open={props.open}>
                <DrawerHeader />
                <ChatInputBar />
            </Main>
            <Drawer
                sx={{
                width: drawerWidth,
                flexShrink: { sm: 0 },
                '& .MuiDrawer-paper': {
                 width: drawerWidth,
                },}}
                variant="persistent"
                anchor="right"
                open={props.open}>
        <DrawerHeader>
          <IconButton onClick={props.handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <ChatDetailsSidebar />
      </Drawer>
        </ThemeProvider>
    )
};

export default MainChatView;