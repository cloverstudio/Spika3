import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import { Box, Button, CircularProgress } from "@mui/material";
import Typography from "@mui/material/Typography";

import CheckIcon from "@mui/icons-material/Check";

import { dynamicBaseQuery } from "../../../../api/api";
import { useCreateRoomMutation } from "../../api/room";
import {
    fetchContacts,
    selectContacts,
    selectContactLoading,
    setKeyword,
} from "../../slices/contacts";

import User from "../../../../types/User";

import useIsInViewport from "../../../../hooks/useIsInViewport";

import SearchBox from "../SearchBox";
import useStrings from "../../../../hooks/useStrings";
import { useAppDispatch, useAppSelector } from "../../../../hooks";
import { showNoteEditModal } from "../../slices/rightSidebar";

declare const UPLOADS_BASE_URL: string;

export default function SidebarContactList({
    handleUserClick,
    hideSearchBox,
    selectedUserIds,
    hideBots,
}: {
    handleUserClick?: (user: User) => void;
    hideSearchBox?: boolean;
    selectedUserIds?: number[];
    hideBots?: boolean;
}): React.ReactElement {
    const strings = useStrings();
    const dispatch = useAppDispatch();
    const loading = useSelector(selectContactLoading());
    const isFetching = loading === "pending";
    const [displayBots, setDisplayBots] = React.useState(false);

    const { sortedByDisplayName } = useSelector(selectContacts(displayBots));

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
        <Box sx={{ overflowY: "auto", maxHeight: "100%" }}>
            {!hideSearchBox && (
                <SearchBox
                    onSearch={(keyword: string) => {
                        dispatch(setKeyword(keyword));
                        dispatch(fetchContacts());
                    }}
                />
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
                        {strings.contacts}
                    </Button>
                    <Button
                        size="small"
                        variant={displayBots ? "outlined" : "text"}
                        color="inherit"
                        onClick={() => setDisplayBots(true)}
                        sx={{ width: "100%" }}
                    >
                        {strings.bots}
                    </Button>
                </Box>
            )}

            {!sortedByDisplayName.length && !isFetching && (
                <Typography align="center">{strings.noContacts}</Typography>
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
                            />
                        ))}
                    </Box>
                );
            })}
            <Box textAlign="center" height="50px" ref={elementRef}>
                {isFetching && <CircularProgress />}
            </Box>
        </Box>
    );
}

type ContactRowProps = {
    name: string;
    onClick?: () => any;
    selected: boolean;
    avatarFileId?: number;
    SelectedIcon?: () => React.ReactElement;
};

export function ContactRow({
    name,
    onClick,
    selected,
    avatarFileId,
    SelectedIcon = () => <CheckIcon />,
}: ContactRowProps): React.ReactElement {
    return (
        <Box px={2.5} display="flex" py={1.5} sx={{ cursor: "pointer" }} onClick={onClick || null}>
            <Avatar
                sx={{ width: 50, height: 50 }}
                alt={name}
                src={`${UPLOADS_BASE_URL}/${avatarFileId}`}
            />
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
        </Box>
    );
}
