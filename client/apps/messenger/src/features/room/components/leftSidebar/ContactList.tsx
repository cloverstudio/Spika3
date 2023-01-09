import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import { Box } from "@mui/material";
import Typography from "@mui/material/Typography";

import CheckIcon from "@mui/icons-material/Check";

import { dynamicBaseQuery } from "../../../../api/api";
import { useCreateRoomMutation } from "../../api/room";
import { fetchContact, selectContacts, selectContactLoading } from "../../slices/contacts";

import User from "../../../../types/User";

import useIsInViewport from "../../../../hooks/useIsInViewport";
import { hideLeftSidebar } from "../../slices/leftSidebar";

import SearchBox from "../SearchBox";
import useStrings from "../../../../hooks/useStrings";

declare const UPLOADS_BASE_URL: string;

export default function SidebarContactList({
    handleUserClick,
    selectedUsersIds,
}: {
    handleUserClick?: (user: User) => void;
    selectedUsersIds?: number[];
}): React.ReactElement {
    const strings = useStrings();
    const dispatch = useDispatch();
    const { list, count, sortedByDisplayName } = useSelector(selectContacts);
    const loading = useSelector(selectContactLoading());
    const isFetching = loading !== "idle";

    const [page, setPage] = useState(1);
    const [keyword, setKeyword] = useState("");
    const { isInViewPort, elementRef } = useIsInViewport();

    const navigate = useNavigate();
    const [createRoom] = useCreateRoomMutation();
    const onChatClick = () => dispatch(hideLeftSidebar());

    const hasMoreContactsToLoad = count > list.length;

    useEffect(() => {
        dispatch(fetchContact({ page: page, keyword }));
    }, [dispatch, page]);

    useEffect(() => {
        dispatch(fetchContact({ page: 1, keyword }));
    }, [keyword]);

    useEffect(() => {
        if (isInViewPort && hasMoreContactsToLoad) {
            setPage((page) => page + 1);
        }
    }, [isInViewPort, isFetching, hasMoreContactsToLoad]);

    useEffect(() => {
        if (page === 1) dispatch(fetchContact({ page: 1, keyword }));
        else setPage(1);
    }, [keyword]);

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
        <Box sx={{ overflowY: "auto", maxHeight: "100%" }}>
            <Box mt={3}>
                <SearchBox
                    onSearch={(keyword: string) => {
                        setKeyword(keyword);
                    }}
                />
            </Box>

            {!list.length && !isFetching && (
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
