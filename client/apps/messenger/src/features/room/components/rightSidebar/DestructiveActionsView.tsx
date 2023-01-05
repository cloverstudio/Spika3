import React from "react";

import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ExitToApp from "@mui/icons-material/ExitToApp";
import DoDisturb from "@mui/icons-material/DoDisturb";
import DeleteOutline from "@mui/icons-material/DeleteOutline";

import { RoomType } from "../../../../types/Rooms";
import { useShowBasicDialog } from "../../../../hooks/useModal";
import { useDeleteRoomMutation, useLeaveRoomMutation } from "../../api/room";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { hideRightSidebar } from "../../slices/rightSidebar";
import { removeRoom } from "../../slices/leftSidebar";
import { selectUserId } from "../../../../store/userSlice";
import useStrings from "../../../../hooks/useStrings";
import { useBlockUserMutation } from "../../api/user";

export interface DetailsDestructiveActionsProps {
    room: RoomType;
}

export function DetailsDestructiveActionsView({ room }: DetailsDestructiveActionsProps) {
    const strings = useStrings();
    const { type, id, users } = room;

    const userId = useSelector(selectUserId);
    const showBasicDialog = useShowBasicDialog();
    const [leaveRoom] = useLeaveRoomMutation();
    const [deleteRoom] = useDeleteRoomMutation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [blockUser] = useBlockUserMutation();

    const userIsAdmin = users.find((u) => u.userId === userId).isAdmin;
    const otherUserId = users.find((u) => u.userId !== userId)?.userId;

    const handleLeave = () => {
        const haveOtherAdmins = users.filter((u) => u.isAdmin && u.userId !== userId).length > 0;

        if (!haveOtherAdmins) {
            return showBasicDialog({
                text: strings.cantLeaveAdminGroup,
                title: strings.unavailableAction,
                allowButtonLabel: strings.ok,
            });
        }

        showBasicDialog(
            {
                text: strings.leaveGroupQuestion,
                title: strings.confirm,
                allowButtonLabel: strings.ok,
                denyButtonLabel: strings.cancel,
            },
            () =>
                leaveRoom({ roomId: id })
                    .unwrap()
                    .then(() => {
                        dispatch(hideRightSidebar());
                        dispatch(removeRoom(id));
                        navigate("/app");
                    })
        );
    };

    const handleDelete = () => {
        showBasicDialog(
            {
                text: strings.deleteGroupQuestion,
                title: strings.confirm,
                allowButtonLabel: strings.ok,
                denyButtonLabel: strings.cancel,
            },
            () =>
                deleteRoom({ roomId: id })
                    .unwrap()
                    .then(() => {
                        dispatch(hideRightSidebar());
                        dispatch(removeRoom(id));
                        navigate("/app");
                    })
        );
    };

    const handleBlock = () => {
        showBasicDialog(
            {
                text: strings.blockUserQuestion,
                title: strings.confirm,
                allowButtonLabel: strings.yes,
                denyButtonLabel: strings.cancel,
            },
            () =>
                blockUser(otherUserId)
                    .unwrap()
                    .then(() => {
                        console.log("done");
                    })
        );
    };

    return (
        <Stack pt={5.5} spacing={1}>
            {type === "private" && (
                <IconButton
                    size="large"
                    sx={{
                        p: 1,
                        "&.MuiButtonBase-root:hover": {
                            bgcolor: "transparent",
                        },
                        width: "100%",
                    }}
                    onClick={handleBlock}
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
                            {strings.blockUser}
                        </Typography>
                    </Stack>
                </IconButton>
            )}
            {type === "group" && (
                <IconButton
                    disableRipple
                    size="large"
                    sx={{
                        p: 1,

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
                            {strings.exitGroup}
                        </Typography>
                    </Stack>
                </IconButton>
            )}

            {type === "group" && userIsAdmin && (
                <IconButton
                    disableRipple
                    size="large"
                    sx={{
                        p: 1,
                        "&.MuiButtonBase-root:hover": {
                            bgcolor: "transparent",
                        },
                        width: "100%",
                    }}
                    onClick={handleDelete}
                >
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{
                            width: "100%",
                        }}
                    >
                        <DeleteOutline style={{ fill: "red" }} />

                        <Typography variant="subtitle1" color="red">
                            {strings.deleteGroup}
                        </Typography>
                    </Stack>
                </IconButton>
            )}
        </Stack>
    );
}
