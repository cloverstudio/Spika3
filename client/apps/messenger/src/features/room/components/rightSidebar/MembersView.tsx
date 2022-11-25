import React, { useState, useEffect } from "react";
import {
    Box,
    Stack,
    IconButton,
    Typography,
    Avatar,
    TextField,
    Button,
    Dialog,
    DialogTitle,
} from "@mui/material";
import { Close, Add, Check } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { RoomUserType } from "../../../../types/Rooms";
import { selectUserId } from "../../../../store/userSlice";
import { useUpdateRoomMutation } from "../../api/room";
import { useGetContactsQuery, useGetContactsByKeywordQuery } from "../../api/contacts";
import User from "../../../../types/User";
import Contacts from "../../../../types/Contacts";
import { refreshOne as refreshOneRoom } from "../../slices/leftSidebar";

declare const UPLOADS_BASE_URL: string;

export interface DetailsMembersProps {
    members: RoomUserType[];
    roomId: number;
}

export function DetailsMemberView(props: DetailsMembersProps) {
    const { members, roomId } = props;

    const userId = useSelector(selectUserId);
    const dispatch = useDispatch();
    const [update] = useUpdateRoomMutation();
    const [openAddDialog, setOpenAddDialog] = useState(false);

    const userIsAdmin = members.find((u) => u.userId === userId).isAdmin;

    const handlePromoteToAdmin = (memberId: number) => {
        handleUpdateGroup({
            adminUserIds: members
                .filter((m) => m.isAdmin)
                .map((u) => u.userId)
                .concat(memberId),
        });
    };

    const removeMemberWithId = (memberId: number) => {
        handleUpdateGroup({
            userIds: members.filter((m) => m.userId !== memberId).map((u) => u.userId),
        });
    };

    const handleUpdateGroup = async (data: any) => {
        const { room } = await update({ roomId, data }).unwrap();
        dispatch(refreshOneRoom(room));
    };

    const closeAddMemberDialog = (addIds?: Array<number>) => {
        if (addIds && addIds.length > 0) {
            const membersArray: number[] = [...addIds];

            members.forEach((participant) => {
                membersArray.push(participant.userId);
            });

            handleUpdateGroup({ userIds: membersArray });
        }

        setOpenAddDialog(false);
    };

    return (
        <Box padding="12px">
            <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    width: "100%",
                }}
            >
                <Typography variant="h6"> {members.length} Members</Typography>
                {userIsAdmin && (
                    <IconButton size="large" color="primary" onClick={() => setOpenAddDialog(true)}>
                        <Add />
                    </IconButton>
                )}
            </Stack>
            <Box
                component={"ul"}
                sx={{
                    width: "100%",
                    maxWidth: 720,
                    paddingLeft: "0",
                    borderBottomColor: "background.paper"
                }}
            >
                {members.map((roomUser, i) => {
                    const { user } = roomUser;

                    return (
                        <Box
                            component={"li"}
                            key={i}
                            sx={{
                                marginBottom: "10px",
                                listStyle: "none",
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <Box
                                sx={{
                                    paddingLeft: "0",
                                    paddingRight: "0",
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                }}
                            >
                                <Avatar
                                    alt={user.displayName}
                                    src={`${UPLOADS_BASE_URL}/${user.avatarFileId}`}
                                    sx={{
                                        marginRight: "5px",
                                    }}
                                />
                                <Box>{user.displayName}  {roomUser.isAdmin?" (Admin) ":""} {roomUser.isBot?" (Bot) " :""} </Box>
                            </Box>

                            <Box>
                                {roomUser.isAdmin ? (
                                    <></>
                                ) : user.isBot ? (
                                    <></>
                                ) : (
                                    userIsAdmin && (
                                        <Box display="flex">
                                            <Button
                                                size="small"
                                                variant="text"
                                                color="primary"
                                                onClick={() => handlePromoteToAdmin(user.id)}
                                                sx={{ mr: 1 }}
                                            >
                                                Make admin
                                            </Button>

                                            <IconButton
                                                size="large"
                                                color="primary"
                                                onClick={() => removeMemberWithId(user.id)}
                                            >
                                                <Close />
                                            </IconButton>
                                        </Box>
                                    )
                                )}
                            </Box>
                        </Box>
                    );
                })}
            </Box>

            {openAddDialog && (
                <AddMembersDialog
                    open={openAddDialog}
                    onClose={closeAddMemberDialog}
                    onSave={closeAddMemberDialog}
                    roomId={roomId}
                    addedIds={[]}
                    existedMembers={members}
                />
            )}
        </Box>
    );
}

export interface AddMembersDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (arg0: Array<number>) => void;
    roomId: number;
    addedIds: number[];
    existedMembers: RoomUserType[];
}

export function AddMembersDialog(props: AddMembersDialogProps) {
    const [searchTerm, setSearchTerm] = React.useState("");
    const [searchTermDelay, setSearchTermDelay] = React.useState("");
    const [contacts, setContacts] = React.useState<Contacts>(null);
    const contactSearchResult = useGetContactsByKeywordQuery(searchTermDelay);
    const { onClose, open } = props;
    const { data: contactData } = useGetContactsQuery({ page: 1, keyword: "" });
    const [selectedIds, setSelectedIds] = React.useState<Array<number>>([]);

    useEffect(() => {
        if (contactData) {
            setContacts(contactData);
        }
    }, [contactData]);

    const handleRowClick = (userId: number) => {
        if (selectedIds.indexOf(userId) === -1) {
            setSelectedIds([...selectedIds, userId]);
        } else {
            setSelectedIds(selectedIds.filter((selectedUserId) => selectedUserId !== userId));
        }
    };

    const handleSaveClick = async () => {
        props.onSave(selectedIds);
    };

    useEffect(() => {
        if (contactSearchResult.data) {
            setContacts(contactSearchResult.data);
        }
    }, [contactSearchResult]);

    let timerId: NodeJS.Timeout;

    return (
        <Dialog onClose={onClose} open={open}>
            <DialogTitle sx={{ textAlign: "center" }}>Add Members</DialogTitle>
            <IconButton
                disableRipple
                size="large"
                sx={{
                    ml: 1,
                    "&.MuiButtonBase-root:hover": {
                        bgcolor: "transparent",
                    },
                    margin: "0",
                    padding: "5px",
                    position: "absolute",
                    right: "10px",
                    top: "12px",
                }}
                onClick={onClose}
            >
                <Close />
            </IconButton>
            <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    width: "100%",
                }}
            >
                <TextField
                    id="outlined-basic"
                    label="Search user"
                    variant="outlined"
                    sx={{ width: "80%" }}
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        clearTimeout(timerId);
                        timerId = setTimeout(() => {
                            setSearchTermDelay(e.target.value);
                        }, 500);
                    }}
                />
            </Stack>
            <Box width="300px" m="1rem">
                <Box display="flex" justifyContent="space-between" width={"100%"}>
                    <Box width={"100%"}>
                        {contacts
                            ? contacts.list.map((u) => (
                                  <AddMemberRow
                                      key={u.id}
                                      user={u}
                                      onClick={handleRowClick}
                                      existed={
                                          !!props.existedMembers.find(
                                              (member) => member.userId === u.id
                                          )
                                      }
                                      checked={selectedIds.includes(u.id)}
                                  />
                              ))
                            : null}
                    </Box>
                </Box>
            </Box>
            <Button
                variant="contained"
                size="medium"
                sx={{ margin: 2 }}
                onClick={() => {
                    handleSaveClick();
                }}
            >
                Add
            </Button>
        </Dialog>
    );
}

export interface AddMembersRowProps {
    user: User;
    onClick: (arg0: number) => void;
    existed: boolean;
    checked: boolean;
}

export function AddMemberRow({
    user,
    onClick,
    existed,
    checked,
}: AddMembersRowProps): React.ReactElement {
    return (
        <Box
            px={2.5}
            display="flex"
            py={1.5}
            sx={{ cursor: existed ? "" : "pointer", opacity: existed ? 0.3 : 1.0 }}
            onClick={() => {
                onClick(user.id);
            }}
        >
            <Avatar
                sx={{ width: 50, height: 50 }}
                alt={user.displayName}
                src={`${UPLOADS_BASE_URL}/${user.avatarFileId}`}
            />
            <Box
                ml={2}
                display="flex"
                flexGrow={1}
                justifyContent="space-between"
                alignItems="center"
            >
                <Typography fontWeight="500">{user.displayName}</Typography>

                {checked ? <Check /> : null}
            </Box>
        </Box>
    );
}
