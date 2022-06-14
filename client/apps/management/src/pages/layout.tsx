import React, { useEffect } from "react";
import { styled, ThemeProvider } from "@mui/material/styles";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import { useNavigate, useLocation } from "react-router-dom";
import * as constants from "../../../../lib/constants";
import logo from "../assets/logo.svg";
import theme from "../theme";
import FilterView from "../components/filterView";

import {
    CssBaseline,
    Box,
    Typography,
    Toolbar,
    IconButton,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    Stack,
    Menu,
    MenuItem,
} from "@mui/material";

import {
    Menu as MenuIcon,
    Notifications as NotificationsIcon,
    ChevronLeft as ChevronLeftIcon,
    Dashboard as DashboardIcon,
    ArrowBackIos as ArrowBackIosIcon,
    Person as UserIcon,
    Devices as DeviceIcon,
    MeetingRoom as RoomIcon,
    Logout as LogoutIcon,
    AccountCircle,
} from "@mui/icons-material/";

import SnackBar from "../components/snackBar";
import BasicDialog from "../components/basicDialog";
import { logout } from "../store/adminAuthSlice";
import { showSnackBar } from "../store/uiSlice";
import { useDispatch } from "react-redux";

const drawerWidth = 240;

export enum FilterType {
    User = "user",
    Device = "device",
    Room = "room",
    None = "none",
}

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

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

const Drawer = styled(MuiDrawer, {
    shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
    "& .MuiDrawer-paper": {
        position: "relative",
        whiteSpace: "nowrap",
        width: drawerWidth,
        transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
        boxSizing: "border-box",
        ...(!open && {
            overflowX: "hidden",
            transition: theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            width: theme.spacing(7),
            [theme.breakpoints.up("sm")]: {
                width: theme.spacing(9),
            },
        }),
    },
}));

type LayoutParams = {
    subtitle: string;
    children: React.ReactNode;
    showBack: boolean | undefined;
};

function DashboardContent({ subtitle, children, showBack = false }: LayoutParams) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = React.useState(true);
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [filterType, setFilterType] = React.useState<FilterType>(FilterType.None);
    const openMenu = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const toggleDrawer = () => {
        setOpen(!open);
    };

    const handleFilterSelection = () => {};
    const handleListItemClick = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
        index: number
    ) => {
        switch (index) {
            case 0: {
                navigate("/dashboard");
                break;
            }
            case 1: {
                navigate("/user");

                break;
            }
            case 2: {
                navigate("/device");

                break;
            }
            case 3: {
                navigate("/room");

                break;
            }
            default: {
                //statements;
                break;
            }
        }
    };

    useEffect(() => {
        (async () => {
            switch (location.pathname) {
                case "/dashboard": {
                    setSelectedIndex(0);
                    setFilterType(FilterType.None);
                    break;
                }
                case "/user": {
                    setSelectedIndex(1);
                    setFilterType(FilterType.User);
                    break;
                }
                case "/device": {
                    setSelectedIndex(2);
                    setFilterType(FilterType.Device);
                    break;
                }
                case "/room": {
                    setSelectedIndex(3);
                    setFilterType(FilterType.Room);
                    break;
                }
                default: {
                    //statements;
                    break;
                }
            }
        })();
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ display: "flex" }}>
                <CssBaseline />
                <AppBar position="absolute" open={open} elevation={0}>
                    <Toolbar
                        sx={{
                            pr: "24px", // keep right padding when drawer closed
                            backgroundColor: theme.palette.spikaMainBackgroundColor.main,
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
                            <MenuIcon style={{ fill: theme.palette.spikaButton.main }} />
                        </IconButton>

                        {showBack ? (
                            <IconButton color="inherit" onClick={() => navigate(-1)}>
                                <ArrowBackIosIcon />
                            </IconButton>
                        ) : null}

                        <Typography
                            component="h1"
                            variant="h6"
                            color="inherit"
                            noWrap
                            sx={{ flexGrow: 1 }}
                        ></Typography>
                        <IconButton
                            color="inherit"
                            onClick={(e) => {
                                handleClick(e);
                            }}
                        >
                            <AccountCircle style={{ fill: theme.palette.spikaButton.main }} />
                        </IconButton>
                        <Menu
                            id="basic-menu"
                            anchorEl={anchorEl}
                            open={openMenu}
                            onClose={handleClose}
                            MenuListProps={{
                                "aria-labelledby": "basic-button",
                            }}
                        >
                            <MenuItem
                                onClick={(e) => {
                                    dispatch(logout());
                                    dispatch(
                                        showSnackBar({
                                            severity: "success",
                                            text: "Singed out",
                                        })
                                    );
                                    localStorage.removeItem(constants.ADMIN_ACCESS_TOKEN);
                                    navigate("/");
                                }}
                            >
                                Logout
                            </MenuItem>
                        </Menu>
                    </Toolbar>
                </AppBar>
                <Drawer variant="permanent" open={open}>
                    <Toolbar
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            px: [1],
                        }}
                    >
                        <Stack
                            justifyContent="center"
                            alignItems="center"
                            spacing={2}
                            direction="row"
                            marginLeft="1em"
                        >
                            <Box component="img" height="40px" width="40px" src={logo} />
                            <Typography
                                component="h1"
                                variant="h6"
                                color={theme.palette.spikaLightGrey.main}
                                noWrap
                            >
                                Spika
                            </Typography>
                        </Stack>

                        <IconButton onClick={toggleDrawer}>
                            <ChevronLeftIcon style={{ fill: theme.palette.spikaLightGrey.main }} />
                        </IconButton>
                    </Toolbar>
                    <List
                        sx={{
                            // selected and (selected + hover) states
                            "&& .Mui-selected, && .Mui-selected:hover": {
                                bgcolor: theme.palette.spikaButton.main,
                            },
                            ml: "0.5em",
                            mr: "0.5em",
                        }}
                    >
                        <ListItemButton
                            selected={selectedIndex === 0}
                            onClick={(event) => handleListItemClick(event, 0)}
                            sx={{ borderRadius: "1em" }}
                        >
                            <ListItemIcon>
                                <DashboardIcon
                                    style={{ fill: theme.palette.spikaLightGrey.main }}
                                />
                            </ListItemIcon>
                            <ListItemText
                                primary="Dashboard"
                                primaryTypographyProps={{
                                    style: { color: theme.palette.spikaLightGrey.main },
                                }}
                            />
                        </ListItemButton>
                        <ListItemButton
                            selected={selectedIndex === 1}
                            onClick={(event) => handleListItemClick(event, 1)}
                            sx={{ borderRadius: "1em" }}
                        >
                            <ListItemIcon>
                                <UserIcon style={{ fill: theme.palette.spikaLightGrey.main }} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Users"
                                primaryTypographyProps={{
                                    style: { color: theme.palette.spikaLightGrey.main },
                                }}
                            />
                        </ListItemButton>
                        <ListItemButton
                            selected={selectedIndex === 2}
                            onClick={(event) => handleListItemClick(event, 2)}
                            sx={{ borderRadius: "1em" }}
                        >
                            <ListItemIcon>
                                <DeviceIcon style={{ fill: theme.palette.spikaLightGrey.main }} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Devices"
                                primaryTypographyProps={{
                                    style: { color: theme.palette.spikaLightGrey.main },
                                }}
                            />
                        </ListItemButton>
                        <ListItemButton
                            selected={selectedIndex === 3}
                            onClick={(event) => handleListItemClick(event, 3)}
                            sx={{ borderRadius: "1em" }}
                        >
                            <ListItemIcon>
                                <RoomIcon style={{ fill: theme.palette.spikaLightGrey.main }} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Rooms"
                                primaryTypographyProps={{
                                    style: { color: theme.palette.spikaLightGrey.main },
                                }}
                            />
                        </ListItemButton>
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
                        paddingTop: "64px",
                    }}
                >
                    <FilterView type={filterType} onSelect={handleFilterSelection} />
                    {children}
                </Box>
            </Box>
            <SnackBar />
            <BasicDialog />
        </ThemeProvider>
    );
}

export default function Dashboard(props: any): React.ReactElement {
    return <DashboardContent {...props} />;
}
