import React, { useState } from "react";
import {
    Box,
    Stack,
    IconButton,
    Typography,
    Avatar,
    Switch,
    List,
    ListItem,
    ListItemButton,
    ListItemAvatar,
    ListItemText,
} from "@mui/material";
import { Close, ChevronRight, Add, ExitToApp, WarningAmber, DoDisturb } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { hide as hideRightSidebar } from "./slice/rightSidebarSlice";
import { useParams } from "react-router-dom";
import { useGetRoomQuery } from "./api/room";
import { RoomUserType } from "../../types/Rooms";
import { selectUser } from "../../store/userSlice";

export default function RightSidebar(): React.ReactElement {
    const dispatch = useDispatch();
    const roomId = +useParams().id;
    const { data, isLoading } = useGetRoomQuery(roomId);

    const otherUser = data.room.users[1];
    const isItPrivate = data.room.type === "private";
    var membersArray: RoomUserType[] = [];
    const me = useSelector(selectUser);
    var amIAdmin: boolean = false;

    data.room.users
        .filter((person) => person.userId == me.id)
        .map((filteredPerson) => (amIAdmin = filteredPerson.isAdmin));

    if (data.room.users.length > 4) {
        membersArray = data.room.users.slice(0, 4);
    } else {
        membersArray = data.room.users;
    }
    return (
        <Box borderLeft="0.5px solid #C9C9CA" padding="0" margin="0">
            <Box height="80.5px" borderBottom="0.5px solid #C9C9CA">
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "left",
                        paddingTop: "15px",
                    }}
                >
                    <IconButton
                        size="large"
                        onClick={(e) => {
                            dispatch(hideRightSidebar());
                        }}
                    >
                        <Close />
                    </IconButton>
                    {isItPrivate ? (
                        <Typography variant="h6">Chat details</Typography>
                    ) : (
                        <Typography variant="h6">Group details</Typography>
                    )}
                </Stack>
            </Box>
            <Box>
                <Stack
                    direction="column"
                    alignItems="center"
                    spacing={1}
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        paddingTop: "15px",
                    }}
                >
                    {isItPrivate ? (
                        <Avatar alt={otherUser.user.displayName} src={otherUser.user.avatarUrl} />
                    ) : (
                        <Avatar alt={data.room.name} src={data.room.avatarUrl} />
                    )}
                    {isItPrivate ? (
                        <Typography variant="h6">{otherUser.user.displayName}</Typography>
                    ) : (
                        <Typography variant="h6">{data.room.name}</Typography>
                    )}
                </Stack>
            </Box>
            <Box>
                <Stack
                    direction="column"
                    alignItems="center"
                    spacing={1}
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        paddingTop: "15px",
                    }}
                >
                    <IconButton
                        disableRipple
                        size="large"
                        sx={{
                            ml: 1,
                            "&.MuiButtonBase-root:hover": {
                                bgcolor: "transparent",
                            },
                            width: "100%",
                            margin: "0",
                        }}
                    >
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
                            <Typography variant="subtitle1">
                                Shared Media, Links and Docs
                            </Typography>
                            <ChevronRight />
                        </Stack>
                    </IconButton>
                    <IconButton
                        disableRipple
                        size="large"
                        sx={{
                            ml: 1,
                            "&.MuiButtonBase-root:hover": {
                                bgcolor: "transparent",
                            },
                            width: "100%",
                            paddingTop: "0",
                        }}
                    >
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
                            <Typography variant="subtitle1">Call history</Typography>
                            <ChevronRight />
                        </Stack>
                    </IconButton>
                    <IconButton
                        disableRipple
                        size="large"
                        sx={{
                            ml: 1,
                            "&.MuiButtonBase-root:hover": {
                                bgcolor: "transparent",
                            },
                            width: "100%",
                        }}
                    >
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
                            <Typography variant="subtitle1">Notes</Typography>
                            <ChevronRight />
                        </Stack>
                    </IconButton>
                    <IconButton
                        disableRipple
                        size="large"
                        sx={{
                            ml: 1,
                            "&.MuiButtonBase-root:hover": {
                                bgcolor: "transparent",
                            },
                            width: "100%",
                            paddingTop: "0",
                            paddingBottom: "12px",
                        }}
                    >
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
                            <Typography variant="subtitle1">Favorite messages</Typography>
                            <ChevronRight />
                        </Stack>
                    </IconButton>
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            width: "100%",
                            padding: "0px 12px",
                        }}
                    >
                        <Typography variant="subtitle1">Pin chat</Typography>
                        <Switch />
                    </Stack>
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            width: "100%",
                            padding: "0px 12px 12px 12px",
                        }}
                    >
                        <Typography variant="subtitle1">Mute notifications</Typography>
                        <Switch />
                    </Stack>
                </Stack>
            </Box>
            {!isItPrivate ? (
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
                        <Typography variant="h6"> {data.room.users.length} Members</Typography>
                        <IconButton size="large" color="primary">
                            <Add />
                        </IconButton>
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
                        {membersArray.map((value) => {
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
                                                onClick={(e) => {}}
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
                    >
                        <Typography variant="subtitle1">Show more</Typography>
                    </IconButton>
                </Box>
            ) : null}
            <Box>
                {isItPrivate ? (
                    <IconButton
                        disableRipple
                        size="large"
                        sx={{
                            ml: 1,
                            "&.MuiButtonBase-root:hover": {
                                bgcolor: "transparent",
                            },
                            width: "100%",
                        }}
                    >
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "flex-start",
                                width: "100%",
                            }}
                        >
                            <DoDisturb style={{ fill: "red" }} />
                            <Typography variant="subtitle1" color="red">
                                Block {otherUser.user.displayName}
                            </Typography>
                        </Stack>
                    </IconButton>
                ) : null}
                <IconButton
                    disableRipple
                    size="large"
                    sx={{
                        ml: 1,
                        "&.MuiButtonBase-root:hover": {
                            bgcolor: "transparent",
                        },
                        width: "100%",
                    }}
                >
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "flex-start",
                            width: "100%",
                        }}
                    >
                        <WarningAmber style={{ fill: "red" }} />
                        {isItPrivate ? (
                            <Typography variant="subtitle1" color="red">
                                Report {otherUser.user.displayName}
                            </Typography>
                        ) : (
                            <Typography variant="subtitle1" color="red">
                                Report group
                            </Typography>
                        )}
                    </Stack>
                </IconButton>
                <IconButton
                    disableRipple
                    size="large"
                    sx={{
                        ml: 1,
                        "&.MuiButtonBase-root:hover": {
                            bgcolor: "transparent",
                        },
                        width: "100%",
                    }}
                >
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "flex-start",
                            width: "100%",
                        }}
                    >
                        <ExitToApp style={{ fill: "red" }} />
                        {isItPrivate ? (
                            <Typography variant="subtitle1" color="red">
                                Leave conversation
                            </Typography>
                        ) : (
                            <Typography variant="subtitle1" color="red">
                                Exit group
                            </Typography>
                        )}
                    </Stack>
                </IconButton>
            </Box>
        </Box>
    );
}
