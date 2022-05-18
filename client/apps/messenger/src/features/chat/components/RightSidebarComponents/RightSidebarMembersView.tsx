import React, { useState, useEffect, useCallback } from "react";
import {
    Box,
    Stack,
    IconButton,
    Typography,
    Avatar,
    List,
    ListItem,
    ListItemButton,
    ListItemAvatar,
    ListItemText,
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
import { refreshOne as refreshOneRoom } from "../../../chat/slice/roomSlice";

declare const UPLOADS_BASE_URL: string;

const debounce = (fn: any, delay: any) => {
    let timerId: any;
    return (...args: any[]) => {
        clearTimeout(timerId);
        timerId = setTimeout(() => fn(...args), delay);
    };
};

export interface DetailsMembersProps {
    members: RoomUserType[];
    roomId: number;
}

export function DetailsMemberView(props: DetailsMembersProps) {
    const { members, roomId } = props;
    const me = useSelector(selectUser);
    var amIAdmin: boolean = false;
    const [showMore, setShowMore] = useState(false);
    const [update, updateMutation] = useUpdateRoomMutation();
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const dispatch = useDispatch();

    members
        .filter((person) => person.userId == me.id)
        .map((filteredPerson) => (amIAdmin = filteredPerson.isAdmin));

    var membersArray: RoomUserType[] = [];
    var memberIdsArray: number[] = [];

    members.forEach((member) => {
        memberIdsArray.push(member.userId);
    });

    const filterMembersArray = () => {
        if (members.length > 4 && showMore) {
            membersArray = members.slice(0, 4);
        } else {
            membersArray = members;
        }
    };

    const removeMemberWithId = (memberId: number) => {
        var membersArray: number[] = [];
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

    const closeAddMemberDialog = () => {
        setOpenAddDialog(false);
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
            <List
                dense
                sx={{
                    width: "100%",
                    maxWidth: 360,
                    bgcolor: "background.paper",
                    paddingLeft: "0",
                }}
            >
                {members.map((value) => {
                    return (
                        <ListItem
                            key={value.user.id}
                            secondaryAction={
                                value.isAdmin ? (
                                    <Typography>Admin</Typography>
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
                                ) : null
                            }
                            disablePadding={true}
                        >
                            <ListItemButton sx={{ paddingLeft: "0", paddingRight: "0" }}>
                                <ListItemAvatar>
                                    <Avatar
                                        alt={value.user.displayName}
                                        src={value.user.avatarUrl}
                                    />
                                </ListItemAvatar>
                                <ListItemText
                                    id={value.user.displayName}
                                    primary={value.user.displayName}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
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
                    roomId={roomId}
                    addedIds={memberIdsArray}
                />
            ) : null}
        </Box>
    );
}

export interface AddMembersDialogProps {
    open: boolean;
    onClose: () => void;
    roomId: number;
    addedIds: number[];
}

export function AddMembersDialog(props: AddMembersDialogProps) {
    const [searchTerm, setSearchTerm] = React.useState("");
    const [members, setMembers] = React.useState<Contacts>(null);
    const searchMembers = useGetContactsByKeywordQuery(searchTerm);
    const { onClose, open, roomId, addedIds } = props;
    const { data, isLoading } = useGetContactsQuery(1);
    const { list, count, sortedByDisplayName } = useSelector(selectContacts);
    var currentMembers = addedIds;
    const [update, updateMutation] = useUpdateRoomMutation();
    const [searchName, setSearchName] = React.useState("");

    const handleRowClick = (userId: number) => {
        if (addedIds.includes(userId)) {
            const index = addedIds.indexOf(userId, 0);
            if (index > -1) {
                currentMembers.splice(index, 1);
            }
        } else {
            currentMembers.push(userId);
        }
    };

    useEffect(() => {
        if (data) {
            setMembers(data);
        }
    }, [data]);

    useEffect(() => {
        console.log(searchMembers.data);
        if (searchMembers.data) {
            setMembers(searchMembers.data);
        }
    }, [searchMembers]);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(String(event));
    };

    const debouncedHandler = useCallback(debounce(handleSearch, 500), []);

    const handleAddClick = async () => {
        try {
            await update({
                roomId: roomId,
                data: { userIds: currentMembers },
            }).unwrap();
            onClose();
        } catch (error) {
            console.error("Update failed ", error);
        }
        onClose();
    };

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
                    value={searchName}
                    onChange={(e) => {
                        setSearchName(e.target.value);
                        debouncedHandler(e.target.value);
                    }}
                />
            </Stack>
            <Box width="300px" m="1rem">
                <Box display="flex" justifyContent="space-between" width={"100%"}>
                    <Box width={"100%"}>
                        {members
                            ? members.list.map((u) => (
                                  <AddMemberRow
                                      key={u.id}
                                      user={u}
                                      onClick={handleRowClick}
                                      checked={addedIds.includes(u.id)}
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
                    handleAddClick();
                }}
            >
                Add
            </Button>
        </Dialog>
    );
}

export interface AddMembersRowProps {
    user: User;
    onClick: Function;
    checked: boolean;
}
export function AddMemberRow({ user, onClick, checked }: AddMembersRowProps): React.ReactElement {
    const [selected, setSelected] = useState(checked);
    const handleRowClick = () => {
        setSelected(!selected);
    };

    useEffect(() => {
        onClick(user.id);
    }, [selected]);

    return (
        <Box
            px={2.5}
            display="flex"
            py={1.5}
            sx={{ cursor: "pointer" }}
            onClick={handleRowClick || null}
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
                <Typography fontWeight="500" fontSize="1rem">
                    {user.displayName}
                </Typography>
                {selected && <Check />}
            </Box>
        </Box>
    );
}
