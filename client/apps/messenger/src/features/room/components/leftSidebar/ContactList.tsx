import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import { Box, Button, CircularProgress, useTheme } from "@mui/material";
import Typography from "@mui/material/Typography";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Cancel";
import { dynamicBaseQuery } from "../../../../api/api";
import { useCreateRoomMutation } from "../../api/room";
import {
    fetchContacts,
    selectContacts,
    selectContactLoading,
    setKeyword,
    resetAdvanceFilters,
    resetContactsListPagination,
    setAdvanceFiltersApplied,
    setAdvanceFiltersModalOpen,
} from "../../slices/contacts";
import User from "../../../../types/User";

import useIsInViewport from "../../../../hooks/useIsInViewport";

import SearchBox from "../SearchBox";
import { useAppDispatch, useAppSelector } from "../../../../hooks";
import { showNoteEditModal } from "../../slices/rightSidebar";
import { RoomUserType } from "../../../../types/Rooms";
import { useTranslation } from "react-i18next";
import { AdvanceFiltersModal } from "./AdvanceFiltersModal";

declare const UPLOADS_BASE_URL: string;

export default function SidebarContactList({
    handleUserClick,
    hideSearchBox,
    selectedUserIds,
    hideBots,
    hideDescription,
    existingMembers = [],
    hideExistingMembers,
}: {
    handleUserClick?: (user: User) => void;
    hideSearchBox?: boolean;
    selectedUserIds?: number[];
    hideBots?: boolean;
    hideDescription?: boolean;
    existingMembers?: RoomUserType[];
    hideExistingMembers?: boolean;
}): React.ReactElement {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const loading = useSelector(selectContactLoading());
    const isFetching = loading === "pending";
    const [displayBots, setDisplayBots] = React.useState(false);
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";

    const { sortedByDisplayName } = useSelector(
        selectContacts({ displayBots, hideExistingMembers, existingMembers }),
    );

    const { areAdvanceFiltersApplied, isAdvanceFiltersModalOpen, advanceFilters } = useAppSelector(
        (state) => state.contacts,
    );

    const allowToggle = !hideBots;

    const { isInViewPort, elementRef } = useIsInViewport();

    const isSomeNoteEditing =
        useAppSelector((state) => state.rightSidebar.activeTab) === "editNote";

    const navigate = useNavigate();
    const [createRoom] = useCreateRoomMutation();

    useEffect(() => {
        if (isInViewPort) {
            dispatch(fetchContacts());
        }
    }, [isInViewPort, dispatch]);

    useEffect(() => {
        return () => {
            dispatch(setKeyword(""));
            dispatch(fetchContacts());
        };
    }, [dispatch]);

    const defaultHandleUserClick = async (user: User) => {
        if (isSomeNoteEditing) {
            dispatch(showNoteEditModal());
            return;
        }

        try {
            const res = await dynamicBaseQuery(`/messenger/rooms/users/${user.id}`);

            const room = res.data.room;

            if (room.id) {
                navigate(`/rooms/${room.id}`);
            }
        } catch (error) {
            const created = await createRoom({
                userIds: [user.id],
            }).unwrap();

            if (created.room.id) {
                navigate(`/rooms/${created.room.id}?showBotInfo=1`);
            }
        }
    };

    const onUserClick = handleUserClick || defaultHandleUserClick;

    return (
        <>
            {!hideSearchBox && (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-evenly",
                        mb: 3,
                    }}
                >
                    <SearchBox
                        onSearch={(keyword: string) => {
                            dispatch(setKeyword(keyword));
                            dispatch(fetchContacts());
                        }}
                        marginBottom={0}
                        resetKeyword={areAdvanceFiltersApplied}
                    />
                    <Box
                        sx={{
                            display: "flex",
                            cursor: "pointer",
                            alignItems: "center",
                            mr: 2,
                        }}
                        onClick={() => {
                            if (areAdvanceFiltersApplied) {
                                dispatch(setAdvanceFiltersApplied(false));
                                dispatch(resetAdvanceFilters());
                                dispatch(resetContactsListPagination());
                                dispatch(fetchContacts());
                            } else {
                                dispatch(setAdvanceFiltersModalOpen(true));
                            }
                        }}
                    >
                        {areAdvanceFiltersApplied ? (
                            <FilterAltIcon
                                fontSize="large"
                                sx={{
                                    width: "25px",
                                    height: "25px",
                                    color: isDarkMode ? "#fff" : "#4696F0",
                                }}
                            />
                        ) : (
                            <FilterAltOutlinedIcon
                                fontSize="large"
                                sx={{
                                    width: "25px",
                                    height: "25px",
                                    color: isDarkMode ? "#9A9A9A" : "#4696F0",
                                }}
                            />
                        )}
                        <Box position="relative">
                            <Typography
                                sx={{
                                    fontSize: "16px",
                                    fontWeight: 500,
                                    color: isDarkMode ? "#9A9A9A" : "#4696F0",
                                    ...(areAdvanceFiltersApplied && {
                                        mr: 1.5,
                                        ...(isDarkMode && { color: "#fff" }),
                                    }),
                                }}
                            >
                                {t("filters")}
                            </Typography>
                            {areAdvanceFiltersApplied && (
                                <CancelIcon
                                    sx={{
                                        color: isDarkMode ? "#fff" : "#4696F0",
                                        position: "absolute",
                                        width: "15px",
                                        height: "15px",
                                        top: "-3px",
                                        right: "-6px",
                                    }}
                                />
                            )}
                        </Box>
                    </Box>
                    <AdvanceFiltersModal
                        isOpen={isAdvanceFiltersModalOpen}
                        onClose={() => {
                            dispatch(setAdvanceFiltersModalOpen(false));
                            dispatch(resetAdvanceFilters());
                        }}
                    />
                </Box>
            )}

            {allowToggle && (
                <Box display="flex" gap={1} px={3} mb={2}>
                    <Button
                        size="small"
                        color="inherit"
                        variant={displayBots ? "text" : "outlined"}
                        onClick={() => setDisplayBots(false)}
                        sx={{ width: "100%" }}
                    >
                        {t("contacts")}
                    </Button>
                    <Button
                        size="small"
                        variant={displayBots ? "outlined" : "text"}
                        color="inherit"
                        onClick={() => setDisplayBots(true)}
                        sx={{ width: "100%" }}
                    >
                        {t("bots")}
                    </Button>
                </Box>
            )}

            <Box sx={{ height: "100%", overflowY: "scroll" }}>
                {!sortedByDisplayName.length && !isFetching && (
                    <Typography align="center">{t("noContacts")}</Typography>
                )}
                {sortedByDisplayName.map(([letter, contactList]) => {
                    return (
                        <Box key={letter} mb={2}>
                            <Typography ml={4.75} py={1.5} fontWeight="bold">
                                {letter}
                            </Typography>

                            {(contactList as User[]).map((u) => (
                                <ContactRow
                                    key={u.id}
                                    name={u.displayName}
                                    avatarFileId={u.avatarFileId}
                                    onClick={() => onUserClick(u)}
                                    selected={selectedUserIds && selectedUserIds.includes(u.id)}
                                    description={
                                        !hideDescription &&
                                        (displayBots ? "Bot" : u.telephoneNumber)
                                    }
                                />
                            ))}
                        </Box>
                    );
                })}
                <Box textAlign="center" height="50px" ref={elementRef}>
                    {isFetching && <CircularProgress />}
                </Box>
            </Box>
        </>
    );
}

type ContactRowProps = {
    name: string;
    onClick?: () => any;
    selected: boolean;
    avatarFileId?: number;
    SelectedIcon?: () => React.ReactElement;
    description?: string;
};

export function ContactRow({
    name,
    onClick,
    selected,
    avatarFileId,
    SelectedIcon = () => <CheckIcon />,
    description,
}: ContactRowProps): React.ReactElement {
    return (
        <Box px={2.5} display="flex" py={1.5} sx={{ cursor: "pointer" }} onClick={onClick || null}>
            <Avatar
                sx={{ width: 50, height: 50 }}
                alt={name}
                src={`${UPLOADS_BASE_URL}/${avatarFileId}`}
            />
            <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
                <Box
                    ml={2}
                    display="flex"
                    flexGrow={1}
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Typography fontWeight="500">{name}</Typography>
                    {selected && <SelectedIcon />}
                </Box>
                {description && (
                    <Typography ml={2} color="text.secondary">
                        {description}
                    </Typography>
                )}
            </Box>
        </Box>
    );
}
