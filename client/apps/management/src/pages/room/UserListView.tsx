import React, { useEffect, useState } from "react";
import {
    Typography,
    TextField,
    Grid,
    Button,
    Avatar,
    Stack,
    Divider,
    Chip,
    Drawer,
    Box,
} from "@mui/material";
import { Close, Add, Check } from "@mui/icons-material";

import User from "../../types/User";
import Contacts from "../../types/Contacts";
import { RoomUserType } from "../../types/Room";

import { useGetUsersQuery, useGetUsersBySearchTermQuery } from "../../api/user";
import { useAddUsersToRoomMutation } from "../../api/room";
import UserType from "../../types/User";
import { useShowBasicDialog, useShowSnackBar } from "../../components/useUI";
import { hide as addUserFinished } from "../../store/rightDrawerSlice";
import { useDispatch } from "react-redux";

declare const UPLOADS_BASE_URL: string;

export interface UserListViewProps {
    roomId: number;
    existedMembers: RoomUserType[];
}

export default function UserListView(props: UserListViewProps) {
    const [searchTerm, setSearchTerm] = React.useState("");
    const [searchTermDelay, setSearchTermDelay] = React.useState("");
    const [contacts, setContacts] = React.useState<User[]>(null);
    const { roomId, existedMembers } = props;
    const { data, isLoading } = useGetUsersQuery(0);
    const { data: userSearchData, isLoading: userSearchIsLoading } =
        useGetUsersBySearchTermQuery(searchTermDelay);
    const [selectedIds, setSelectedIds] = React.useState<Array<number>>([]);
    const [addUsers, addUsersMutation] = useAddUsersToRoomMutation();
    const showSnackBar = useShowSnackBar();
    const dispatch = useDispatch();

    const handleRowClick = (userId: number) => {
        if (selectedIds.indexOf(userId) === -1) {
            setSelectedIds([...selectedIds, userId]);
        } else {
            setSelectedIds(selectedIds.filter((selectedUserId) => selectedUserId !== userId));
        }
    };

    const handleSaveClick = async () => {
        try {
            await addUsers({
                roomId: roomId,
                userIds: selectedIds,
            });
            dispatch(addUserFinished());
        } catch (e) {
            console.error(e);
            showSnackBar({
                severity: "error",
                text: "Server error, please check browser console.",
            });
        }
    };

    let timerId: NodeJS.Timeout;

    useEffect(() => {
        if (data) {
            removeExistingUsers(data.list);
        }
    }, [data]);

    useEffect(() => {
        if (!userSearchIsLoading) {
            removeExistingUsers(userSearchData.list);
        }
    }, [userSearchData]);

    const removeExistingUsers = (list: UserType[]) => {
        var parsedArray = [...list];
        existedMembers.forEach((mItem) => {
            list.forEach((sItem, index) => {
                if (mItem.userId === sItem.id) {
                    parsedArray.splice(index, 1);
                }
            });
        });
        setContacts(parsedArray);
    };

    return (
        <Box m={2}>
            <Typography>Add Members</Typography>
            <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                    pt: 2,
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
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        clearTimeout(timerId);
                        timerId = setTimeout(() => {
                            setSearchTermDelay(e.target.value);
                        }, 500);
                    }}
                    fullWidth
                    size="small"
                    inputProps={{ style: { fontSize: 15 } }}
                    InputLabelProps={{ style: { fontSize: 15 } }}
                />
            </Stack>
            <Box width="100%" pt={2}>
                <Box display="flex" justifyContent="space-between" width={"100%"}>
                    <Box width={"100%"}>
                        {contacts
                            ? contacts.map((u) => (
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
                sx={{ margin: 1 }}
                onClick={() => {
                    handleSaveClick();
                }}
                color="spikaButton"
            >
                Add to room
            </Button>
        </Box>
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
