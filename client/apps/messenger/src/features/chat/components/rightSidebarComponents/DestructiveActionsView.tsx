import React from "react";
import { Box, Stack, IconButton, Typography } from "@mui/material";
import { ExitToApp, WarningAmber, DoDisturb } from "@mui/icons-material";

import { RoomType } from "../../../../types/Rooms";
import { useShowBasicDialog } from "../../../../hooks/useModal";
import { useLeaveRoomMutation } from "../../api/room";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { hide } from "../../slice/rightSidebarSlice";
import { removeRoom } from "../../slice/roomSlice";
import { selectUserId } from "../../../../store/userSlice";

export interface DetailsDestructiveActionsProps {
    room: RoomType;
}

export function DetailsDestructiveActionsView({ room }: DetailsDestructiveActionsProps) {
    const { type, id, users } = room;

    const userId = useSelector(selectUserId);
    const showBasicDialog = useShowBasicDialog();
    const [leaveRoom] = useLeaveRoomMutation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLeave = () => {
        const haveOtherAdmins = users.filter((u) => u.isAdmin && u.userId !== userId).length > 0;

        if (!haveOtherAdmins) {
            return showBasicDialog({
                text: "Can't leave group where you are only admin",
                title: "Unavailable action",
                allowButtonLabel: "OK",
            });
        }

        showBasicDialog(
            {
                text: "Leave group?",
                title: "Confirmation",
                allowButtonLabel: "OK",
                denyButtonLabel: "Cancel",
            },
            () =>
                leaveRoom({ roomId: id })
                    .unwrap()
                    .then(() => {
                        dispatch(hide());
                        dispatch(removeRoom(id));
                        navigate("/app");
                    })
        );
    };

    return (
        <Box>
            {type === "private" && (
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
                            Block user
                        </Typography>
                    </Stack>
                </IconButton>
            )}
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
                    {type === "private" ? (
                        <Typography variant="subtitle1" color="red">
                            Report user
                        </Typography>
                    ) : (
                        <Typography variant="subtitle1" color="red">
                            Report group
                        </Typography>
                    )}
                </Stack>
            </IconButton>
            {type === "group" && (
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
                    onClick={handleLeave}
                >
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{
                            width: "100%",
                        }}
                    >
                        <ExitToApp style={{ fill: "red" }} />

                        <Typography variant="subtitle1" color="red">
                            Exit group
                        </Typography>
                    </Stack>
                </IconButton>
            )}
        </Box>
    );
}
