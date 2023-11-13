import React, { useContext } from "react";
import { Avatar, Box, IconButton, Typography } from "@mui/material";
import logo from "@assets/logo.svg";
import Logout from "@mui/icons-material/Logout";
import { useLoaderData, useLocation, useNavigate } from "react-router-dom";
import * as Constants from "@lib/constants";
import ThemeSwitch from "./ThemeSwitch";
import { ThemeType, ThemeContext } from "@lib/theme";
import { Link } from "react-router-dom";

export default function LeftSidebar() {
    return (
        <LeftSidebarLayout>
            <Box>
                <LeftSidebarHeader />
                <LeftSidebarContent />
            </Box>
        </LeftSidebarLayout>
    );
}

function LeftSidebarLayout({
    children,
}: {
    children: React.ReactElement | React.ReactElement[];
}): React.ReactElement {
    return (
        <Box
            borderRight="1px solid"
            height="100vh"
            overflow="hidden"
            display="flex"
            flexDirection="column"
            sx={{ width: { xs: "100vw", md: "auto" }, borderColor: "divider" }}
        >
            {children}
        </Box>
    );
}

function LeftSidebarHeader() {
    const navigate = useNavigate();
    const { theme, setTheme } = useContext(ThemeContext);

    const handleLogout = () => {
        localStorage.removeItem(Constants.ADMIN_ACCESS_TOKEN);
        navigate("/login");
    };

    return (
        <Box px={2.5} borderBottom="0.5px solid" sx={{ borderColor: "divider" }}>
            <Box display="flex" height="80px" justifyContent="space-between">
                <Box
                    component="a"
                    href="/messenger/app"
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    sx={{ userSelect: "none" }}
                >
                    <img width="40px" height="40px" src={logo} />
                </Box>
                <Box display="flex" gap={2} alignItems="center">
                    <ThemeSwitch
                        checked={theme === "dark"}
                        onChange={(e) => {
                            const mode: ThemeType = e.target.checked ? "dark" : "light";
                            setTheme(mode);
                            window.localStorage.setItem(Constants.LSKEY_THEME, mode);
                        }}
                    />
                    <Box>
                        <IconButton onClick={handleLogout}>
                            <Logout
                                fontSize="large"
                                sx={{
                                    width: "25px",
                                    height: "25px",
                                    color: "text.navigation",
                                    cursor: "pointer",
                                }}
                            />
                        </IconButton>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

function LeftSidebarContent() {
    const { count } = useLoaderData() as any;

    return (
        <Box py={2} display="flex" flexDirection="column">
            <NavigationItem
                url="users"
                title="Users"
                subtitle="Manage chat users"
                count={count.users}
            />
            <NavigationItem
                url="bots"
                title="Bots"
                subtitle="Manage chat bots"
                count={count.bots}
            />
            <NavigationItem
                url="groups"
                title="Groups"
                subtitle="Manage chat groups"
                count={count.groups}
            />
        </Box>
    );
}

function NavigationItem({
    url,
    title,
    subtitle,
    count,
}: {
    url: string;
    title: string;
    subtitle: string;
    count: number;
}) {
    const { pathname } = useLocation();
    const isActive = pathname === `/${url}`;
    return (
        <Link to={url} style={{ textDecoration: "none" }}>
            <Box
                bgcolor={isActive ? "action.hover" : "transparent"}
                px={2.5}
                py={1.5}
                display="flex"
            >
                <Avatar alt={title} sx={{ width: 50, height: 50 }} />
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    ml={2}
                    flexGrow={1}
                    overflow="hidden"
                >
                    <Box flexGrow={1} overflow="hidden">
                        <Typography mb={1} fontWeight="600" color="text.primary">
                            {title}
                        </Typography>
                        <Typography
                            sx={{
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                            }}
                            color="text.secondary"
                            lineHeight="1.125rem"
                        >
                            {subtitle}
                        </Typography>
                    </Box>
                    <Typography color="text.tertiary">{count}</Typography>
                </Box>
            </Box>
        </Link>
    );
}
