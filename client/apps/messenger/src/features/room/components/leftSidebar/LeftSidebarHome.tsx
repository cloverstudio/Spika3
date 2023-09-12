import React, { Dispatch } from "react";
import { useDispatch, useSelector } from "react-redux";
import Avatar from "@mui/material/Avatar";
import { Box } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Settings from "@mui/icons-material/Settings";
import Add from "@mui/icons-material/AddOutlined";
import ChatIcon from "@mui/icons-material/Chat";
import CallIcon from "@mui/icons-material/Call";
import ContactIcon from "@mui/icons-material/AccountCircle";
import { SvgIconTypeMap } from "@mui/material/SvgIcon";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Badge from "@mui/material/Badge";

import {
    selectActiveTab,
    setActiveTab,
    shouldShowProfileEditor,
    setOpenEditProfile,
} from "../../slices/leftSidebar";

import SidebarContactList from "./ContactList";
import SidebarCallList from "./CallList";
import SidebarChatList from "./ChatList";
import LeftSidebarLayout from "./LeftSidebarLayout";
import { EditProfileView } from "../EditProfile";

import logo from "../../../../assets/logo.svg";
import { useGetUserQuery } from "../../../auth/api/auth";
import { Link } from "react-router-dom";
import { useGetUnreadCountQuery } from "../../api/room";

declare const UPLOADS_BASE_URL: string;

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
    { name: "contact", icon: ContactIcon, Element: () => <SidebarContactList /> },
];

export default function LeftSidebarHome({
    setSidebar,
}: {
    setSidebar: Dispatch<React.SetStateAction<string>>;
}): React.ReactElement {
    const dispatch = useDispatch();
    const activeTab = useSelector(selectActiveTab);
    const { data: userData } = useGetUserQuery();
    const theme = useTheme();

    const profileEditingOpen = useSelector(shouldShowProfileEditor);

    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const handleChangeTab = (value: "call" | "chat" | "contact"): void => {
        dispatch(setActiveTab(value));
    };
    const setOpenEditor = () => dispatch(setOpenEditProfile(!profileEditingOpen));
    const closeEditor = () => dispatch(setOpenEditProfile(false));
    const ActiveElement = navigation.find((n) => n.name === activeTab)?.Element;
    const generalLayout = !isMobile
        ? { display: "flex", height: "100vh" }
        : { display: "flex", flexDirection: "column", height: "100vh" };
    const userSettingsAndMessageLayout = !isMobile
        ? {
              display: "flex",
              flexDirection: "column",
              width: "80px",
              justifyContent: "space-between",
              backgroundColor: theme.palette.mode === "light" ? "#F9F9F9" : "#282828",
              alignItems: "center",
          }
        : { display: "flex", height: "80px", justifyContent: "space-between" };

    const settingsBoxProps = !isMobile ? {} : { display: "flex", gap: 2, alignItems: "center" };

    return (
        <LeftSidebarLayout>
            {profileEditingOpen ? (
                <EditProfileView user={userData?.user} onClose={closeEditor} />
            ) : (
                <Box sx={{ ...generalLayout }}>
                    <Box
                        px={isMobile ? 2.5 : 0}
                        mb={isMobile ? 2 : 0}
                        borderBottom="0.5px solid"
                        sx={{ borderColor: "divider" }}
                    >
                        <Box sx={{ ...userSettingsAndMessageLayout }}>
                            {isMobile && (
                                <Box
                                    component={Link}
                                    to="/app"
                                    display="flex"
                                    flexDirection="column"
                                    justifyContent="center"
                                    sx={{ userSelect: "none" }}
                                >
                                    <img width="40px" height="40px" src={logo} />
                                </Box>
                            )}
                            {isMobile ? (
                                <Box sx={{ ...settingsBoxProps }}>
                                    <Box>
                                        <Avatar
                                            alt={userData?.user.displayName}
                                            src={`${UPLOADS_BASE_URL}/${userData?.user.avatarFileId}`}
                                        />
                                    </Box>
                                    <Box>
                                        <IconButton onClick={() => setOpenEditor()}>
                                            <Settings
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
                                    <Box>
                                        <IconButton onClick={() => setSidebar("new_chat")}>
                                            <Add
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
                            ) : (
                                <Box
                                    display="flex"
                                    flexDirection="column"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    height="100vh"
                                >
                                    <Box
                                        display="flex"
                                        justifyContent="space-between"
                                        flexDirection="column"
                                        mt="24px"
                                        gap="24px"
                                    >
                                        {navigation.map((item) => (
                                            <ActionIcon
                                                key={item.name}
                                                Icon={item.icon}
                                                handleClick={() => handleChangeTab(item.name)}
                                                isActive={activeTab === item.name}
                                                isChat={item.name === "chat"}
                                            />
                                        ))}
                                    </Box>
                                    <Box mb="24px">
                                        <Avatar
                                            sx={{
                                                width: "40px",
                                                height: "40px",
                                                cursor: "pointer",
                                            }}
                                            alt={userData?.user.displayName}
                                            src={`${UPLOADS_BASE_URL}/${userData?.user.avatarFileId}`}
                                            onClick={() => setOpenEditor()}
                                        />
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Box>

                    {isMobile && (
                        <Box order={1} px={5} pt={2} pb={3}>
                            <Box display="flex" justifyContent="space-between">
                                {navigation.map((item) => (
                                    <ActionIcon
                                        key={item.name}
                                        Icon={item.icon}
                                        handleClick={() => handleChangeTab(item.name)}
                                        isActive={activeTab === item.name}
                                        isChat={item.name === "chat"}
                                    />
                                ))}
                            </Box>
                        </Box>
                    )}

                    <Box flex={1} overflow="hidden" pt={!isMobile && "16px"} pb="16px">
                        <ActiveElement isMobile={isMobile} setSidebar={setSidebar} />
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
    isChat: boolean;
};

function ActionIcon({ Icon, isActive, handleClick, isChat }: ActionIconProps) {
    const { data: unreadCount } = useGetUnreadCountQuery();

    const theme = useTheme();

    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const styles = isMobile
        ? { width: "52px", height: "52px", borderRadius: "50%" }
        : { width: "40px", height: "40px", borderRadius: "10px" };

    return (
        <Box
            onClick={handleClick}
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            p={1}
            bgcolor={isActive ? "action.hover" : "transparent"}
            sx={{
                cursor: "pointer",
                "&:hover": {
                    bgcolor: "action.hover",
                },
            }}
            position="relative"
            {...styles}
        >
            {isChat && unreadCount > 0 && (
                <Badge
                    sx={{
                        "& .MuiBadge-badge": {
                            position: "absolute",
                            top: "-8px",
                            left: "2px",
                            transform: "none",
                        },
                    }}
                    color="error"
                    badgeContent={unreadCount}
                    max={99}
                />
            )}
            <Icon sx={{ width: "25px", color: isActive ? "primary.main" : "text.navigation" }} />
        </Box>
    );
}
