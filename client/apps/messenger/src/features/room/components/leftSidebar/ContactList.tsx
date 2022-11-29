import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Avatar, Box, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

import { dynamicBaseQuery } from "../../../../api/api";
import { useCreateRoomMutation } from "../../api/room";
import { fetchContact, selectContacts, selectContactLoading } from "../../slices/contacts";

import User from "../../../../types/User";
import { FilterAltOutlined } from "@mui/icons-material";

import useIsInViewport from "../../../../hooks/useIsInViewport";
import { hideLeftSidebar } from "../../slices/leftSidebar";

import SearchBox from "./SearchBox";
import EditFiltersDialog, { defaultFilters, FiltersFormType } from "./EditFiltersDialog";
import useStrings from "../../../../hooks/useStrings";
import FilterPills from "./FilterPills";

declare const UPLOADS_BASE_URL: string;

export default function SidebarContactList({
    handleUserClick,
    selectedUsersIds,
}: {
    handleUserClick?: (user: User) => void;
    selectedUsersIds?: number[];
}): React.ReactElement {
    const strings = useStrings();

    const [filters, setFilters] = useState<FiltersFormType>(defaultFilters);
    const [filtersLength, setFiltersLength] = useState(0);
    const [editingFilters, setEditingFilters] = useState(false);
    const dispatch = useDispatch();
    const { list, count, sortedByDisplayName } = useSelector(selectContacts);
    const loading = useSelector(selectContactLoading());
    const isFetching = loading !== "idle";

    const [page, setPage] = useState(1);
    const { isInViewPort, elementRef } = useIsInViewport();
    const navigate = useNavigate();
    const [createRoom] = useCreateRoomMutation();
    const onChatClick = () => dispatch(hideLeftSidebar());

    const hasMoreContactsToLoad = count > list.length;

    useEffect(() => {
        dispatch(fetchContact({ page, filters }));
    }, [dispatch, filters, page]);

    useEffect(() => {
        if (isInViewPort && hasMoreContactsToLoad) {
            setPage((page) => page + 1);
        }
    }, [isInViewPort, isFetching, hasMoreContactsToLoad]);

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

    const onSaveFilters = (filters: FiltersFormType) => {
        setPage(1);
        setFilters(filters);
    };

    const onUserClick = handleUserClick || defaultHandleUserClick;

    return (
        <Box sx={{ overflowY: "auto", maxHeight: "100%" }}>
            <Box
                display="flex"
                pr={3}
                mb={2}
                justifyContent="space-between"
                alignItems="center"
                mt={3}
            >
                <SearchBox
                    onSearch={(keyword: string) => {
                        setPage(1);
                        setFilters({ ...filters, keyword });
                    }}
                />
                <Box
                    height="100%"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    flexShrink={0}
                    sx={{ cursor: "pointer" }}
                    onClick={() => setEditingFilters(true)}
                >
                    <FilterAltOutlined sx={{ width: "22px", color: "primary.main" }} />
                    <Typography sx={{ flexShrink: 0 }} color="primary.main">{`${strings.filters}${
                        filtersLength ? ` (${filtersLength})` : ""
                    }`}</Typography>
                </Box>
            </Box>

            <FilterPills filters={filters} setFiltersLength={setFiltersLength} />

            {!list.length && !isFetching && (
                <Typography mt={3} align="center">
                    {strings.noContacts}
                </Typography>
            )}

            {list.length > 0 && !isFetching && filtersLength > 0 && (
                <Typography mt={4} mb={2} fontWeight="bold" ml={3}>
                    {count} {strings.results}
                </Typography>
            )}

            {sortedByDisplayName.map(([letter, contactList]) => {
                if (filtersLength) {
                    return (contactList as User[]).map((u) => (
                        <ContactRow
                            key={u.id}
                            name={u.displayName}
                            avatarUrl={u.avatarUrl}
                            avatarFileId={u.avatarFileId}
                            onClick={() => onUserClick(u)}
                            selected={selectedUsersIds && selectedUsersIds.includes(u.id)}
                        />
                    ));
                }

                return (
                    <Box key={letter} mb={2}>
                        <Typography ml={4.75} py={1.5} fontWeight="bold">
                            {letter}
                        </Typography>

                        {(contactList as User[]).map((u) => (
                            <ContactRow
                                key={u.id}
                                name={u.displayName}
                                avatarUrl={u.avatarUrl}
                                avatarFileId={u.avatarFileId}
                                onClick={() => onUserClick(u)}
                                selected={selectedUsersIds && selectedUsersIds.includes(u.id)}
                            />
                        ))}
                    </Box>
                );
            })}
            {editingFilters && (
                <EditFiltersDialog
                    onSave={onSaveFilters}
                    initialFilters={filters}
                    onClose={() => setEditingFilters(false)}
                />
            )}
            <div ref={elementRef}></div>
        </Box>
    );
}

type ContactRowProps = {
    name: string;
    onClick?: () => any;
    selected: boolean;
    avatarUrl?: string;
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
