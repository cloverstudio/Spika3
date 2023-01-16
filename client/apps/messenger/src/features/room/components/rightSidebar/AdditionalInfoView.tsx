import React from "react";

import { Box } from "@mui/material";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import ChevronRight from "@mui/icons-material/ChevronRight";
import { useDispatch, useSelector } from "react-redux";

import { RoomType } from "../../../../types/Rooms";
import { setActiveTab } from "../../slices/rightSidebar";
import { useShowSnackBar } from "../../../../hooks/useModal";
import {
    useMuteRoomMutation,
    useUnmuteRoomMutation,
    usePinRoomMutation,
    useUnpinRoomMutation,
} from "../../api/room";

import { selectUserId } from "../../../../../src/store/userSlice";

import useStrings from "../../../../hooks/useStrings";

export interface Props {
    roomData: RoomType;
}

export function DetailsAdditionalInfoView(props: Props) {
    const strings = useStrings();
    const room: RoomType = props.roomData;
    const dispatch = useDispatch();
    const showSnackBar = useShowSnackBar();
    const [muteRoom] = useMuteRoomMutation();
    const [unmuteRoom] = useUnmuteRoomMutation();
    const [pinRoom] = usePinRoomMutation();
    const [unpinRoom] = useUnpinRoomMutation();

    const { type, users } = room;
    const userId = useSelector(selectUserId);
    const userIsAdmin = users.find((u) => u.userId === userId).isAdmin;

    return (
        <Box>
            <Stack
                direction="column"
                alignItems="center"
                spacing={3}
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    paddingTop: 5.5,
                }}
            >
                {/* <Stack
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
                    <Box component="span">Shared Media, Links and Docs</Box>
                    <ChevronRight />
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
                    }}
                >
                    <Box component="span">Call history</Box>
                    <ChevronRight />
                </Stack> */}
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    onClick={() => dispatch(setActiveTab("notes"))}
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "100%",
                        cursor: "pointer",
                    }}
                >
                    <Box component="span">{strings.notes}</Box>
                    <ChevronRight />
                </Stack>
                {((type === "group" && userIsAdmin) || type === "private") && (
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        onClick={() => dispatch(setActiveTab("settings"))}
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            width: "100%",
                            cursor: "pointer",
                        }}
                    >
                        <Box component="span">{strings.settings}</Box>
                        <ChevronRight />
                    </Stack>
                )}

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
                    <Box component="span">{strings.pinChat}</Box>
                    <Switch
                        checked={room.pinned}
                        onChange={async (e) => {
                            try {
                                if (e.target.checked) {
                                    await pinRoom({ roomId: room.id });
                                } else {
                                    await unpinRoom({ roomId: room.id });
                                }
                            } catch (e: any) {
                                console.error(e);
                                showSnackBar({
                                    severity: "error",
                                    text: String(e.message),
                                });
                            }
                        }}
                    />
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
                    }}
                >
                    <Box component="span">{strings.muteNotifications}</Box>
                    <Switch
                        checked={room.muted}
                        onChange={async (e) => {
                            try {
                                if (e.target.checked) {
                                    await muteRoom({ roomId: room.id });
                                } else {
                                    await unmuteRoom({ roomId: room.id });
                                }
                            } catch (e: any) {
                                console.error(e);
                                showSnackBar({
                                    severity: "error",
                                    text: String(e.message),
                                });
                            }
                        }}
                    />
                </Stack>
            </Stack>
        </Box>
    );
}
