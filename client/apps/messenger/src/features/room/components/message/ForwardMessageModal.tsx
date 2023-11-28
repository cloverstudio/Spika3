import React, { useContext, useState, useEffect } from "react";

import { Box } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";

import Close from "@mui/icons-material/Close";

import User from "../../../../types/User";
import useStrings from "../../../../hooks/useStrings";
import { ContactRow } from "../leftSidebar/ContactList";
import SelectedMembers from "../SelectedMembers";
import { ThemeContext } from "../../../../theme";
import SearchBox from "../SearchBox";
import { useAppDispatch, useAppSelector } from "../../../../hooks";
import { fetchContacts, fetchGroupMessageRooms, setKeyword } from "../../slices/contacts";
import { useParams } from "react-router-dom";
import { hideForwardMessageModal, selectActiveMessage } from "../../slices/messages";
import { useForwardMessageMutation } from "../../api/message";
import { Room } from "@prisma/client";
import { useSelector } from "react-redux";
import { CircularProgress } from "@mui/material";

import { selectContacts, selectContactLoading } from "../../slices/contacts";

import useIsInViewport from "../../../../hooks/useIsInViewport";

export default function ForwardMessageModal() {
    const strings = useStrings();
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [selectedGroups, setSelectedGroups] = useState<Room[]>([]);

    const { theme } = useContext(ThemeContext);
    const [forwardMessage] = useForwardMessageMutation();

    const dispatch = useAppDispatch();
    const roomId = parseInt(useParams().id || "");
    const activeMessage = useAppSelector(selectActiveMessage(roomId));

    const isOpen = useAppSelector((state) => state.messages[roomId]?.showForwardMessageModal);

    useEffect(() => {
        return () => {
            setSelectedGroups([]);
            setSelectedUsers([]);
        };
    }, [isOpen]);

    const closeModalHandler = () => {
        dispatch(hideForwardMessageModal(roomId));
    };

    const handleSave = () => {
        forwardMessage({
            roomIds: selectedGroups.map((g) => g.id),
            messageIds: [activeMessage.id],
            userIds: selectedUsers.map((u) => u.id),
        });

        closeModalHandler();
    };

    const handleUserClick = (user: User): void => {
        const userIsSelected = [...selectedUsers.map(({ id }) => id)].includes(user.id);
        const users = userIsSelected
            ? selectedUsers.filter(({ id }) => id !== user.id)
            : [...selectedUsers, user];
        setSelectedUsers(users);
    };

    const handleGroupClick = (group: Room): void => {
        const groupIsSelected = [...selectedGroups.map(({ id }) => id)].includes(group.id);
        const groups = groupIsSelected
            ? selectedGroups.filter(({ id }) => id !== group.id)
            : [...selectedGroups, group];
        setSelectedGroups(groups);
    };

    return (
        <Dialog
            onClose={closeModalHandler}
            open={!!isOpen}
            maxWidth="xs"
            sx={{
                ".MuiDialog-paper": {
                    backgroundColor: "background.default",
                },
                "& .MuiDialog-paper": { width: "100%" },
            }}
        >
            <Box px={2.5} py={2} sx={{ overflow: "hidden" }} className={theme}>
                <DialogTitle sx={{ textAlign: "center", p: 0, mb: 2 }}>
                    {strings.forwardMessage}
                </DialogTitle>
                <IconButton
                    size="large"
                    sx={{
                        "&.MuiButtonBase-root:hover": {
                            bgcolor: "transparent",
                        },
                        position: "absolute",
                        right: 20,
                        top: 20,
                        p: 0,
                    }}
                    onClick={closeModalHandler}
                >
                    <Close />
                </IconButton>

                <SelectedMembers
                    selectedUsers={selectedUsers}
                    selectedGroups={selectedGroups}
                    onRemove={handleUserClick}
                    onGroupRemove={handleGroupClick}
                />

                <Box mx={-2.5}>
                    <SearchBox
                        onSearch={(keyword: string) => {
                            dispatch(setKeyword(keyword));
                            dispatch(fetchContacts());
                            dispatch(fetchGroupMessageRooms());
                        }}
                    />
                </Box>

                <Box mb={2} mx={-2.5} maxHeight="50vh" sx={{ overflowY: "auto" }}>
                    <ForwardToList
                        showGroups
                        hideSearchBox
                        handleUserClick={handleUserClick}
                        handleGroupClick={handleGroupClick}
                        selectedUserIds={selectedUsers.map(({ id }) => id)}
                        selectedGroupsIds={selectedGroups.map(({ id }) => id)}
                    />
                </Box>

                <Button
                    disabled={!selectedGroups.length && !selectedUsers.length}
                    variant="contained"
                    fullWidth
                    size="medium"
                    onClick={handleSave}
                >
                    {strings.forward}
                </Button>
            </Box>
        </Dialog>
    );
}

function ForwardToList({
    handleUserClick,
    handleGroupClick,
    hideSearchBox,
    selectedUserIds = [],
    selectedGroupsIds = [],
    showGroups,
}: {
    handleUserClick?: (user: User) => void;
    handleGroupClick?: (group: Room) => void;
    hideSearchBox?: boolean;
    selectedUserIds: number[];
    selectedGroupsIds: number[];
    showGroups?: boolean;
}): React.ReactElement {
    const strings = useStrings();
    const dispatch = useAppDispatch();
    const loading = useSelector(selectContactLoading());
    const isFetching = loading === "pending";
    const [displayGroups, setDisplayGroups] = useState(false);
    const { sortedByDisplayName, groupsSortedByDisplayName } = useSelector(
        selectContacts({ displayBots: false }),
    );

    const allowToggle = showGroups;

    const { isInViewPort, elementRef } = useIsInViewport();

    useEffect(() => {
        if (isInViewPort) {
            dispatch(fetchGroupMessageRooms());
            dispatch(fetchContacts());
        }
    }, [isInViewPort, dispatch]);

    useEffect(() => {
        return () => {
            dispatch(setKeyword(""));
            dispatch(fetchContacts());
            dispatch(fetchGroupMessageRooms());
        };
    }, [dispatch]);

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
                        variant={displayGroups ? "text" : "outlined"}
                        onClick={() => {
                            setDisplayGroups(false);
                        }}
                        sx={{ width: "100%" }}
                    >
                        {strings.contacts}
                    </Button>
                    {showGroups && (
                        <Button
                            size="small"
                            variant={displayGroups ? "outlined" : "text"}
                            color="inherit"
                            onClick={() => {
                                setDisplayGroups(true);
                            }}
                            sx={{ width: "100%" }}
                        >
                            {strings.groups}
                        </Button>
                    )}
                </Box>
            )}

            {!sortedByDisplayName.length && !isFetching && !displayGroups && (
                <Typography align="center">{strings.noContacts}</Typography>
            )}

            {!groupsSortedByDisplayName.length && !isFetching && displayGroups && (
                <Typography align="center">{strings.noGroups}</Typography>
            )}

            {!displayGroups
                ? sortedByDisplayName.map(([letter, contactList]) => {
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
                                      onClick={() => handleUserClick(u)}
                                      selected={selectedUserIds.includes(u.id)}
                                  />
                              ))}
                          </Box>
                      );
                  })
                : groupsSortedByDisplayName.map(([letter, groupList]) => {
                      return (
                          <Box key={letter} mb={2}>
                              <Typography ml={4.75} py={1.5} fontWeight="bold">
                                  {letter}
                              </Typography>
                              {(groupList as Room[]).map((g) => (
                                  <ContactRow
                                      key={g.id}
                                      name={g.name}
                                      avatarFileId={g.avatarFileId}
                                      onClick={() => handleGroupClick(g)}
                                      selected={selectedGroupsIds.includes(g.id)}
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
