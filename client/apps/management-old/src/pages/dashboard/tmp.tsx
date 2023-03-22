import React from "react";
import { useNavigate } from "react-router-dom";
import {
    Avatar,
    Button,
    CssBaseline,
    TextField,
    FormControlLabel,
    Checkbox,
    Link,
    Grid,
    Box,
    Typography,
    Container,
    Toolbar,
    IconButton,
    Divider,
    Drawer,
    Badge,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
} from "@mui/material";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import { logout } from "../../store/adminAuthSlice";

import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import {
    LockOutlined,
    Menu as MenuIcon,
    Notifications as NotificationsIcon,
    ChevronLeft as ChevronLeftIcon,
    Dashboard as DashboardIcon,
    ShoppingCart as ShoppingCartIcon,
    People as PeopleIcon,
    BarChart as BarChartIcon,
    Layers as LayersIcon,
} from "@mui/icons-material/";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

export default function () {
    const token = useSelector((state: RootState) => state.auth.token);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [open, setOpen] = React.useState(true);
    const toggleDrawer = () => {
        setOpen(!open);
    };

    const theme = createTheme({
        palette: {
            mode: "light",
        },
    });

    function Copyright(props: any) {
        return (
            <Typography variant="body2" color="text.secondary" align="center" {...props}>
                {"Copyright © "}
                <Link color="inherit" href="https://material-ui.com/">
                    Your Website
                </Link>{" "}
                {new Date().getFullYear()}
                {"."}
            </Typography>
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <Box>
                <CssBaseline />
                <AppBar position="absolute" open={open}>
                    <Toolbar
                        sx={{
                            pr: "24px", // keep right padding when drawer closed
                        }}
                    >
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="open drawer"
                            onClick={toggleDrawer}
                            sx={{
                                marginRight: "36px",
                                ...(open && { display: "none" }),
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography
                            component="h1"
                            variant="h6"
                            color="inherit"
                            noWrap
                            sx={{ flexGrow: 1 }}
                        >
                            Dashboard | Spika v3
                        </Typography>
                        <IconButton color="inherit">
                            <Badge badgeContent={4} color="secondary">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <Drawer variant="permanent" open={open}>
                    <Toolbar>
                        <IconButton onClick={toggleDrawer}>
                            <ChevronLeftIcon />
                        </IconButton>
                    </Toolbar>
                    <Divider />
                    <List></List>
                    <Divider />
                    <List>
                        <ListItem button>
                            <ListItemIcon>
                                <DashboardIcon />
                            </ListItemIcon>
                            <ListItemText primary="Dashboard" />
                        </ListItem>
                        <ListItem button>
                            <ListItemIcon>
                                <ShoppingCartIcon />
                            </ListItemIcon>
                            <ListItemText primary="Orders" />
                        </ListItem>
                        <ListItem button>
                            <ListItemIcon>
                                <PeopleIcon />
                            </ListItemIcon>
                            <ListItemText primary="Customers" />
                        </ListItem>
                        <ListItem button>
                            <ListItemIcon>
                                <BarChartIcon />
                            </ListItemIcon>
                            <ListItemText primary="Reports" />
                        </ListItem>
                        <ListItem button>
                            <ListItemIcon>
                                <LayersIcon />
                            </ListItemIcon>
                            <ListItemText primary="Integrations" />
                        </ListItem>
                    </List>
                </Drawer>
                <Box
                    component="main"
                    sx={{
                        backgroundColor: (theme) =>
                            theme.palette.mode === "light"
                                ? theme.palette.grey[100]
                                : theme.palette.grey[900],
                        flexGrow: 1,
                        height: "100vh",
                        overflow: "auto",
                    }}
                >
                    <Toolbar />
                    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                        content
                    </Container>
                </Box>
            </Box>
        </ThemeProvider>
    );
}
