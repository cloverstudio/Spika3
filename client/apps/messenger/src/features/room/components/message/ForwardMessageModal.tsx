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
import {
    fetchContacts,
    fetchGroupMessageRooms,
    fetchRecentChats,
    setKeyword,
} from "../../slices/contacts";
import { useNavigate, useParams } from "react-router-dom";
import { hideForwardMessageModal, selectActiveMessage } from "../../slices/messages";
import { useForwardMessageMutation } from "../../api/message";
import { Room } from "@prisma/client";
import { useSelector } from "react-redux";
import { CircularProgress } from "@mui/material";

import { selectContacts, selectContactLoading } from "../../slices/contacts";

import useIsInViewport from "../../../../hooks/useIsInViewport";
import { dynamicBaseQuery } from "../../../../api/api";
import { useCreateRoomMutation } from "../../api/room";
import { showSnackBar } from "../../../../store/modalSlice";

export default function ForwardMessageModal() {
    const strings = useStrings();
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [selectedGroups, setSelectedGroups] = useState<Room[]>([]);

    const navigate = useNavigate();

    const { theme } = useContext(ThemeContext);
    const [forwardMessage] = useForwardMessageMutation();

    const dispatch = useAppDispatch();
    const roomId = parseInt(useParams().id || "");
    const activeMessage = useAppSelector(selectActiveMessage(roomId));

    const isOpen = useAppSelector((state) => state.messages[roomId]?.showForwardMessageModal);

    useEffect(() => {
        if (isOpen) {
            dispatch(fetchContacts());
            dispatch(fetchGroupMessageRooms());
        }
        return () => {
            setSelectedGroups([]);
            setSelectedUsers([]);
        };
    }, [isOpen]);

    const closeModalHandler = () => {
        dispatch(hideForwardMessageModal(roomId));
    };

    const handleSave = async () => {
        const result = await forwardMessage({
            roomIds: selectedGroups.map((g) => g.id),
            messageIds: [activeMessage.id],
            userIds: selectedUsers.map((u) => u.id),
        });

        if (
            "data" in result &&
            ((selectedUsers.length === 1 && selectedGroups.length === 0) ||
                (selectedUsers.length === 0 && selectedGroups.length === 1))
        ) {
            if (selectedGroups.length === 1) {
                navigate(`/rooms/${selectedGroups[0].id}`);
            } else {
                const userId = selectedUsers[0].id;
                if (!userId) return;
                try {
                    const res = await dynamicBaseQuery(`/messenger/rooms/users/${userId}`);
                    const room = res.data.room;
                    if (room.id) {
                        navigate(`/rooms/${room.id}`);
                    }
                } catch (error) {
                    dispatch(
                        showSnackBar({
                            severity: "error",
                            text: strings.roomNotFound,
                        }),
                    );
                }
            }
        }

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
                    height: "auto",
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

                <Box mb={2} mx={-2.5} height="48vh">
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
        selectContacts({ displayBots: false, excludeBlocked: true }),
    );

    const searchKeyword = useAppSelector((state) => state.contacts.keyword);
    const recentUsers = useAppSelector((state) => state.contacts.recentUserChats);
    const recentGroups = useAppSelector((state) => state.contacts.recentGroupChats);

    const allowToggle = showGroups;

    const { isInViewPort, elementRef } = useIsInViewport();

    useEffect(() => {
        if (isInViewPort) {
            dispatch(fetchGroupMessageRooms());
            dispatch(fetchContacts());
        }
    }, [isInViewPort, dispatch]);

    useEffect(() => {
        dispatch(fetchRecentChats());
        return () => {
            dispatch(setKeyword(""));
        };
    }, [dispatch]);

    return (
        <Box sx={{ height: "100%" }}>
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

            <Box sx={{ overflowY: "auto", overflowX: "hidden", maxHeight: "85%" }}>
                {!sortedByDisplayName.length && !isFetching && !displayGroups && (
                    <Typography align="center">{strings.noContacts}</Typography>
                )}

                {!groupsSortedByDisplayName.length && !isFetching && displayGroups && (
                    <Typography align="center">{strings.noGroups}</Typography>
                )}

                {!displayGroups && !searchKeyword.length && recentUsers?.length > 0 && (
                    <Box>
                        <Typography ml={4.75} py={1.5} fontWeight="bold">
                            Recent chats
                        </Typography>
                        {recentUsers.map((u) => (
                            <Box key={u.id}>
                                <ContactRow
                                    key={u.id}
                                    name={u.displayName}
                                    avatarFileId={u.avatarFileId}
                                    onClick={() => handleUserClick(u)}
                                    selected={selectedUserIds.includes(u.id)}
                                />
                            </Box>
                        ))}
                    </Box>
                )}

                {displayGroups && !searchKeyword.length && recentGroups?.length > 0 && (
                    <Box>
                        <Typography ml={4.75} py={1.5} fontWeight="bold">
                            Recent chats
                        </Typography>
                        {recentGroups.map((g) => (
                            <Box key={g.id}>
                                <ContactRow
                                    key={g.id}
                                    name={g.name}
                                    avatarFileId={g.avatarFileId}
                                    onClick={() => handleGroupClick(g)}
                                    selected={selectedGroupsIds.includes(g.id)}
                                />
                            </Box>
                        ))}
                    </Box>
                )}

                {!displayGroups
                    ? sortedByDisplayName.map(([letter, contactList]) => {
                          const contactListWihFilteredRecentUsers = (contactList as User[]).filter(
                              (u) => {
                                  if (searchKeyword.length > 0) return true;
                                  else if (
                                      !recentUsers?.some((recentUser) => recentUser.id === u.id)
                                  )
                                      return true;
                              },
                          );

                          if (!contactListWihFilteredRecentUsers.length) return null;

                          return (
                              <Box key={letter} mb={2}>
                                  <Typography ml={4.75} py={1.5} fontWeight="bold">
                                      {letter}
                                  </Typography>

                                  {contactListWihFilteredRecentUsers.map((u) => (
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
                          const groupListWihFilteredRecentGroups = (groupList as Room[]).filter(
                              (g) => {
                                  if (searchKeyword.length > 0) return true;
                                  else if (
                                      !recentGroups?.some((recentGroup) => recentGroup.id === g.id)
                                  )
                                      return true;
                              },
                          );

                          if (!groupListWihFilteredRecentGroups.length) return null;

                          return (
                              <Box key={letter} mb={2}>
                                  <Typography ml={4.75} py={1.5} fontWeight="bold">
                                      {letter}
                                  </Typography>
                                  {groupListWihFilteredRecentGroups.map((g) => (
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
        </Box>
    );
}
