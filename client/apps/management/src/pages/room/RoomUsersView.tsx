import React, { useEffect } from "react";
import {
    Typography,
    Paper,
    IconButton,
    Button,
    Avatar,
    List,
    ListItemAvatar,
    ListItemText,
    ListItem,
    Stack,
    Tooltip,
    Box,
} from "@mui/material";

import { LocalPolice, PersonRemove, GppBad, GppGood } from "@mui/icons-material/";
import UserType from "../../types/User";
import theme from "../../theme";
import { useDeleteUserInRoomMutation, useUpdateAdminForRoomMutation } from "../../api/room";
import { useDispatch } from "react-redux";
import { show as addUserToRoom } from "../../store/rightDrawerSlice";
import { useShowBasicDialog, useShowSnackBar } from "../../components/useUI";
import { RoomMixType, RoomUserType } from "../../types/Room";

declare const UPLOADS_BASE_URL: string;

export interface RoomUsersViewProps {
    roomId: number;
    roomData: RoomMixType;
}

export default function RoomUsersView(props: RoomUsersViewProps) {
    const { roomId, roomData } = props;
    const [roomUsers, setRoomUsers] = React.useState<RoomUserType[]>([]);
    const [fullUsers, setFullUsers] = React.useState<UserType[]>([]);
    const [roomType, setRoomType] = React.useState<string>("private");
    const [multipleAdmins, setMultipleAdmins] = React.useState<boolean>(false);
    const [roomUsersData, setRoomUserData] = React.useState<RoomMixType>(roomData);
    const [deleteUserInRoom, deleteUserInRoomMutation] = useDeleteUserInRoomMutation();
    const dispatch = useDispatch();
    const showSnackBar = useShowSnackBar();
    const showBasicDialog = useShowBasicDialog();
    const [updateAdmin, updateAdminMutation] = useUpdateAdminForRoomMutation();

    useEffect(() => {
        (async () => {
            setFullUsers(roomUsersData.users);
            setRoomUsers(roomUsersData.room.users);
            setRoomType(roomUsersData.room.type);
        })();
    }, [roomUsersData]);

    useEffect(() => {
        (async () => {
            setRoomUserData(roomData);
        })();
    }, [roomData]);

    useEffect(() => {
        (async () => {
            areThereMultipleAdmins();
        })();
    }, [roomUsers]);

    const isUserAdmin = (userId: number): boolean => {
        const selectedUser: RoomUserType = roomUsers.find((person) => person.userId === userId);
        return selectedUser.isAdmin;
    };

    const areThereMultipleAdmins = () => {
        var counter = 0;
        roomUsers.forEach((element) => {
            console.log(element);
            if (element.isAdmin) {
                counter += 1;
            }
            console.log(counter);
        });
        console.log(counter);
        setMultipleAdmins(counter > 1);
    };

    const removeUserFromRoom = async (userId: number) => {
        showBasicDialog({ text: "Please confirm delete." }, async () => {
            try {
                await deleteUserInRoom({
                    roomId: roomId,
                    userId: userId,
                });
            } catch (e) {
                console.error(e);
                showSnackBar({
                    severity: "error",
                    text: "Server error, please check browser console.",
                });
            }
        });
    };

    const handleAdmin = async (user: UserType) => {
        if (isUserAdmin(user.id) && !multipleAdmins) {
            showSnackBar({
                severity: "error",
                text: "Room needs to have at least one Admin",
            });
        } else {
            try {
                await updateAdmin({
                    roomId: roomId,
                    userId: user.id,
                });
            } catch (e) {
                console.error(e);
                showSnackBar({
                    severity: "error",
                    text: "Server error, please check browser console.",
                });
            }
        }
    };

    return (
        <Paper>
            <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                padding={1}
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    width: "100%",
                    mb: "1em",
                }}
            >
                <Typography component="h1" variant="h6">
                    Room participants
                </Typography>
                {roomType === "group" ? (
                    <Button
                        type="submit"
                        color="spikaButton"
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        onClick={() => dispatch(addUserToRoom())}
                    >
                        ADD USER
                    </Button>
                ) : null}
            </Stack>
            <List sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}>
                {fullUsers.map((item, index) => (
                    <ListItem
                        key={index}
                        secondaryAction={
                            roomType == "group" ? (
                                <Box>
                                    <Tooltip
                                        title={isUserAdmin(item.id) ? "Remove admin" : "Add admin"}
                                    >
                                        <IconButton
                                            onClick={(e) => {
                                                handleAdmin(item);
                                            }}
                                        >
                                            {isUserAdmin(item.id) ? (
                                                <GppGood
                                                    style={{ fill: theme.palette.spikaButton.main }}
                                                />
                                            ) : (
                                                <GppBad
                                                    style={{ fill: theme.palette.spikaGrey.main }}
                                                />
                                            )}
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Remove member">
                                        <IconButton
                                            edge="end"
                                            aria-label="delete"
                                            onClick={(e) => {
                                                if (multipleAdmins) {
                                                    removeUserFromRoom(item.id);
                                                } else {
                                                    if (isUserAdmin(item.id)) {
                                                        showSnackBar({
                                                            severity: "error",
                                                            text: "Group needs at least one Admin",
                                                        });
                                                    } else {
                                                        removeUserFromRoom(item.id);
                                                    }
                                                }
                                            }}
                                        >
                                            <PersonRemove
                                                style={{ fill: theme.palette.spikaButton.main }}
                                            />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            ) : null
                        }
                    >
                        <ListItemAvatar>
                            <Avatar alt="Remy Sharp" src={`${UPLOADS_BASE_URL}${item.avatarUrl}`} />
                        </ListItemAvatar>
                        <ListItemText primary={item.displayName} />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
}
