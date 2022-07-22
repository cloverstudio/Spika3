import React, { useState, useEffect, useCallback } from "react";
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
import { selectUser } from "../../../../store/userSlice";
import { useUpdateRoomMutation } from "../../api/room";
import { useGetContactsQuery, useGetContactsByKeywordQuery } from "../../api/contacts";
import { selectContacts } from "../../slice/contactsSlice";
import User from "../../../../types/User";
import Contacts from "../../../../types/Contacts";
import { refreshOne as refreshOneRoom } from "../../slice/roomSlice";

declare const UPLOADS_BASE_URL: string;

export interface DetailsMembersProps {
    members: RoomUserType[];
    roomId: number;
}

export function DetailsMemberView(props: DetailsMembersProps) {
    const { members, roomId } = props;
    const me = useSelector(selectUser);
    const [amIAdmin, setAmIAdmin] = useState(false);
    const [showMore, setShowMore] = useState(false);
    const [update, updateMutation] = useUpdateRoomMutation();
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const dispatch = useDispatch();

    let membersArray: RoomUserType[] = [];
    const memberIdsArray: number[] = [];

    useEffect(() => {
        const meInRoom: RoomUserType = members.find((person) => person.userId === me.id);
        setAmIAdmin(meInRoom.isAdmin);

        members.forEach((member) => {
            memberIdsArray.push(member.userId);
        });
    }, []);

    const removeMemberWithId = (memberId: number) => {
        const membersArray: number[] = [];
        members.forEach((participant) => {
            if (participant.userId != memberId) {
                membersArray.push(participant.userId);
            }
        });
        handleUpdateGroup(membersArray);
    };

    const handleUpdateGroup = async (memberIds: number[]) => {
        const { room } = await update({ roomId: roomId, data: { userIds: memberIds } }).unwrap();
        dispatch(refreshOneRoom(room));
    };

    const closeAddMemberDialog = (addIds?: Array<number>) => {
        if (addIds && addIds.length > 0) {
            const membersArray: number[] = [...addIds];

            members.forEach((participant) => {
                membersArray.push(participant.userId);
            });

            handleUpdateGroup(membersArray);
        }

        setOpenAddDialog(false);
    };

    const filterMembersArray = () => {
        if (members.length > 4 && showMore) {
            membersArray = members.slice(0, 4);
        } else {
            membersArray = members;
        }
    };

    useEffect(() => {
        filterMembersArray();
    }, [showMore]);

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
                {amIAdmin ? (
                    <IconButton
                        size="large"
                        color="primary"
                        onClick={(e) => {
                            setOpenAddDialog(true);
                        }}
                    >
                        <Add />
                    </IconButton>
                ) : null}
            </Stack>
            <Box
                component={"ul"}
                sx={{
                    width: "100%",
                    maxWidth: 360,
                    bgcolor: "background.paper",
                    paddingLeft: "0",
                }}
            >
                {members.map((value, index) => {
                    return (
                        <Box
                            component={"li"}
                            key={index}
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
                                    alt={value.user.displayName}
                                    src={`${UPLOADS_BASE_URL}${value.user.avatarUrl}`}
                                    sx={{
                                        marginRight: "5px",
                                    }}
                                />
                                <Box>{value.user.displayName}</Box>
                            </Box>

                            <Box>
                                {value.isAdmin ? (
                                    <span>Admin</span>
                                ) : amIAdmin ? (
                                    <IconButton
                                        size="large"
                                        color="primary"
                                        onClick={(e) => {
                                            removeMemberWithId(value.user.id);
                                        }}
                                    >
                                        <Close />
                                    </IconButton>
                                ) : null}
                            </Box>
                        </Box>
                    );
                })}
            </Box>
            {members.length > 4 ? (
                <IconButton
                    disableRipple
                    size="large"
                    color="primary"
                    sx={{
                        ml: 1,
                        "&.MuiButtonBase-root:hover": {
                            bgcolor: "transparent",
                        },
                        width: "100%",
                        margin: "0",
                        padding: "0",
                    }}
                    onClick={(e) => {
                        setShowMore(!showMore);
                    }}
                >
                    <Typography variant="subtitle1">Show more</Typography>
                </IconButton>
            ) : null}
            {openAddDialog ? (
                <AddMembersDialog
                    open={openAddDialog}
                    onClose={closeAddMemberDialog}
                    onSave={closeAddMemberDialog}
                    roomId={roomId}
                    addedIds={[]}
                    existedMembers={members}
                />
            ) : null}
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
    const { onClose, open, roomId, addedIds } = props;
    const { data: contactData, isLoading } = useGetContactsQuery({ page: 1, keyword: "" });
    const { list, count, sortedByDisplayName } = useSelector(selectContacts);
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
    const [selected, setSelected] = useState(checked);

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
                src={`${UPLOADS_BASE_URL}${user.avatarUrl}`}
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