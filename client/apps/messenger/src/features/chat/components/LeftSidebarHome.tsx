import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, Box, SvgIconTypeMap, IconButton, Typography, Stack } from "@mui/material";
import {
    Settings,
    Edit,
    Chat as ChatIcon,
    Call as CallIcon,
    AccountCircle as ContactIcon,
    ArrowBackIos,
} from "@mui/icons-material";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import {
    selectActiveTab,
    setActiveTab,
    shouldShowProfileEditor,
    setOpenEditProfile,
} from "../slice/sidebarSlice";

import SidebarContactList from "./ContactList";
import SidebarCallList from "./CallList";
import SidebarChatList from "./ChatList";
import LeftSidebarLayout from "./LeftSidebarLayout";
import SearchBox from "./SearchBox";

import logo from "../../../assets/logo.svg";
import { selectUser } from "../../../store/userSlice";

type NavigationType = {
    name: "call" | "chat" | "contact";
    icon: OverridableComponent<SvgIconTypeMap<unknown, "svg">> & {
        muiName: string;
    };
    Element: (props: any) => React.ReactElement;
};

const navigation: NavigationType[] = [
    { name: "chat", icon: ChatIcon, Element: SidebarChatList },
    { name: "call", icon: CallIcon, Element: SidebarCallList },
    { name: "contact", icon: ContactIcon, Element: SidebarContactList },
];

export default function LeftSidebarHome({
    setSidebar,
}: {
    setSidebar: (s: string) => void;
}): React.ReactElement {
    const dispatch = useDispatch();
    const activeTab = useSelector(selectActiveTab);
    const user = useSelector(selectUser);
    const theme = useTheme();

    const profileEditingOpen = useSelector(shouldShowProfileEditor);

    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const handleChangeTab = (value: "call" | "chat" | "contact"): void => {
        dispatch(setActiveTab(value));
    };
    const setOpenEditor = () => dispatch(setOpenEditProfile(!profileEditingOpen));
    const closeEditor = () => dispatch(setOpenEditProfile(false));
    const ActiveElement = navigation.find((n) => n.name === activeTab)?.Element;
    return (
        <LeftSidebarLayout>
            {profileEditingOpen ? (
                <Box px={2.5} borderBottom="0.5px solid #C9C9CA">
                    <Box display="flex" height="80px" justifyContent="space-between">
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "flex-start",
                                width: "100%",
                            }}
                        >
                            <IconButton
                                onClick={(e) => {
                                    closeEditor();
                                }}
                            >
                                <ArrowBackIos />
                            </IconButton>
                            <Typography>Profile</Typography>
                        </Stack>
                    </Box>
                </Box>
            ) : (
                <Box>
                    <Box px={2.5} borderBottom="0.5px solid #C9C9CA">
                        <Box display="flex" height="80px" justifyContent="space-between">
                            <Box display="flex" flexDirection="column" justifyContent="center">
                                <img width="40px" height="40px" src={logo} />
                            </Box>
                            <Box display="flex" alignItems="center">
                                <Box mr={3}>
                                    <IconButton
                                        onClick={(e) => {
                                            setOpenEditor();
                                        }}
                                    >
                                        <Avatar alt={user.displayName} src={user.avatarUrl} />
                                    </IconButton>
                                </Box>
                                <Box mr={3}>
                                    <Settings
                                        sx={{ width: "25px", color: "#9BB4CF", cursor: "pointer" }}
                                    />
                                </Box>
                                <Box>
                                    <Edit
                                        sx={{ width: "25px", color: "#9BB4CF", cursor: "pointer" }}
                                        onClick={() => setSidebar("new_chat")}
                                    />
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                    <Box order={isMobile ? 2 : 0} px={5} pt={2} mb={3}>
                        <Box display="flex" justifyContent="space-between">
                            {navigation.map((item) => (
                                <ActionIcon
                                    key={item.name}
                                    Icon={item.icon}
                                    handleClick={() => handleChangeTab(item.name)}
                                    isActive={activeTab === item.name}
                                />
                            ))}
                        </Box>
                    </Box>
                    <Box mt={3}>
                        <SearchBox />
                    </Box>
                    <Box flex={1} overflow="hidden">
                        <ActiveElement />
                    </Box>
                </Box>
            )}
        </LeftSidebarLayout>
    );
}

type ActionIconProps = {
    Icon: OverridableComponent<SvgIconTypeMap<unknown, "svg">> & {
        muiName: string;
    };
    handleClick: () => void;
    isActive?: boolean;
};

function ActionIcon({ Icon, isActive, handleClick }: ActionIconProps) {
    return (
        <Box
            onClick={handleClick}
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            width="52px"
            height="52px"
            borderRadius="50%"
            p={1}
            bgcolor={isActive ? "#E5F4FF" : "transparent"}
            sx={{
                cursor: "pointer",
                "&:hover": {
                    bgcolor: "#E5F4FF",
                },
            }}
        >
            <Icon sx={{ width: "20px", color: isActive ? "#4696F0" : "#9BB4CF" }} />
        </Box>
    );
}
