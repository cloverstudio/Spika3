import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Avatar from "@mui/material/Avatar";
import { Box, CircularProgress } from "@mui/material";
import Typography from "@mui/material/Typography";

import CheckIcon from "@mui/icons-material/Check";

import {
    fetchContacts,
    selectContacts,
    selectContactLoading,
    setKeyword,
} from "@/store/usersSlice";

import User from "@/types/User";

import useIsInViewport from "@/hooks/useIsInViewport";

import SearchBox from "@/features/groups/SearchBox";
import useStrings from "@/hooks/useStrings";

declare const UPLOADS_BASE_URL: string;

export default function MembersList({
    handleUserClick,
    selectedUserIds,
    hideBots,
}: {
    handleUserClick?: (user: User) => void;
    selectedUserIds?: number[];
    hideBots?: boolean;
}): React.ReactElement {
    const strings = useStrings();
    const dispatch = useDispatch();
    const { sortedByDisplayName } = useSelector(selectContacts(hideBots));
    const loading = useSelector(selectContactLoading());
    const isFetching = loading === "pending";

    const { isInViewPort, elementRef } = useIsInViewport();

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
        console.log({ user });
    };

    const onUserClick = handleUserClick || defaultHandleUserClick;

    return (
        <Box sx={{ overflowY: "auto", maxHeight: "100%" }}>
            <Box mt={3}>
                <SearchBox
                    onSearch={(keyword: string) => {
                        dispatch(setKeyword(keyword));
                        dispatch(fetchContacts());
                    }}
                />
            </Box>

            {!sortedByDisplayName.length && !isFetching && (
                <Typography align="center">{strings.noUsers}</Typography>
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
