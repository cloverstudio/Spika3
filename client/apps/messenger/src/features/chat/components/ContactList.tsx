import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Avatar, Box, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

import { dynamicBaseQuery } from "../../../api/api";
import { useCreateRoomMutation } from "../api/room";
import { useGetContactsQuery } from "../api/contacts";
import { selectContacts } from "../slice/contactsSlice";

import User from "../../../types/User";

import useIsInViewport from "../../../hooks/useIsInViewport";
import { setLeftSidebar } from "../slice/sidebarSlice";

export default function SidebarContactList({
    handleUserClick,
    selectedUsersIds,
}: {
    handleUserClick?: (user: User) => void;
    selectedUsersIds?: number[];
}): React.ReactElement {
    const dispatch = useDispatch();
    const { list, count, sortedByDisplayName } = useSelector(selectContacts);
    const [page, setPage] = useState(1);
    const { isFetching } = useGetContactsQuery(page);
    const { isInViewPort, elementRef } = useIsInViewport();
    const navigate = useNavigate();
    const [createRoom] = useCreateRoomMutation();
    const onChatClick = () => dispatch(setLeftSidebar(false));

    const hasMoreContactsToLoad = count > list.length;

    useEffect(() => {
        if (isInViewPort && !isFetching && hasMoreContactsToLoad) {
            setPage((page) => page + 1);
        }
    }, [isInViewPort, isFetching, hasMoreContactsToLoad]);

    if (!list.length && !isFetching) {
        return <Typography align="center">No contacts</Typography>;
    }

    const defaultHandleUserClick = async (user: User) => {
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
                navigate(`/rooms/${created.room.id}`);
            }
        }
        onChatClick();
    };

    const onUserClick = handleUserClick || defaultHandleUserClick;

    return (
        <Box sx={{ overflowY: "auto" }}>
            {sortedByDisplayName.map(([letter, contactList]) => {
                return (
                    <Box key={letter} mb={2}>
                        <Typography ml={4.75} py={1.5} fontWeight="bold" fontSize="1.1rem">
                            {letter}
                        </Typography>

                        {(contactList as User[]).map((u) => (
                            <ContactRow
                                key={u.id}
                                name={u.displayName}
                                avatarUrl={u.avatarUrl}
                                onClick={() => onUserClick(u)}
                                selected={selectedUsersIds && selectedUsersIds.includes(u.id)}
                            />
                        ))}
                    </Box>
                );
            })}
            <div ref={elementRef}></div>
        </Box>
    );
}

type ContactRowProps = {
    name: string;
    onClick?: () => any;
    selected: boolean;
    avatarUrl?: string;
    SelectedIcon?: () => React.ReactElement;
};

export function ContactRow({
    name,
    onClick,
    selected,
    avatarUrl,
    SelectedIcon = () => <CheckIcon />,
}: ContactRowProps): React.ReactElement {
    return (
        <Box px={2.5} display="flex" py={1.5} sx={{ cursor: "pointer" }} onClick={onClick || null}>
            <Avatar sx={{ width: 50, height: 50 }} alt={name} src={avatarUrl} />
            <Box
                ml={2}
                display="flex"
                flexGrow={1}
                justifyContent="space-between"
                alignItems="center"
            >
                <Typography fontWeight="500" fontSize="1rem">
                    {name}
                </Typography>
                {selected && <SelectedIcon />}
            </Box>
        </Box>
    );
}
