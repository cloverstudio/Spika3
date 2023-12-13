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
    hideDescription,
}: {
    handleUserClick?: (user: User) => void;
    hideSearchBox?: boolean;
    selectedUserIds?: number[];
    hideBots?: boolean;
    hideDescription?: boolean;
}): React.ReactElement {
    const strings = useStrings();
    const dispatch = useAppDispatch();
    const loading = useSelector(selectContactLoading());
    const isFetching = loading === "pending";
    const [displayBots, setDisplayBots] = React.useState(false);

    const { sortedByDisplayName } = useSelector(selectContacts({ displayBots }));

    const cursor = useAppSelector((state) => state.contacts.cursor);
    const count = useAppSelector((state) => state.contacts.count);
    const users = useAppSelector((state) => state.contacts.list);

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

            <Box sx={{ height: "100%", overflowY: "scroll" }}>
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
