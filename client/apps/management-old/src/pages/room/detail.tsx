import React, { useEffect } from "react";
import Layout from "../layout";
import { useNavigate, useParams } from "react-router-dom";
import {
    Typography,
    Paper,
    Grid,
    Button,
    Avatar,
    Stack,
    Divider,
    Chip,
    Drawer,
    Box,
} from "@mui/material";
import {
    useGetRoomByIdQuery,
    useUpdateRoomMutation,
    useGetUsersForRoomQuery,
} from "../../api/room";
import RoomType from "../../types/Room";
import { useShowBasicDialog, useShowSnackBar } from "../../components/useUI";
import RoomUsersView from "./RoomUsersView";
import {
    show as openCreateRoom,
    hide as hideAddUser,
    selectRightSidebarOpen,
} from "../../store/rightDrawerSlice";
import { useSelector, useDispatch } from "react-redux";
import theme from "../../theme";
import UserListView from "./UserListView";

export default function Page() {
    const urlParams = useParams();
    const navigate = useNavigate();
    const [detail, setDetail] = React.useState<RoomType>();
    const { data, isLoading } = useGetRoomByIdQuery(urlParams.id);
    const [chipText, setChipText] = React.useState<string>("");
    const [chipColor, setChipColor] = React.useState<"default" | "success">("default");
    const showSnackBar = useShowSnackBar();
    const showBasicDialog = useShowBasicDialog();
    const [updateRoom, updateRoomMutation] = useUpdateRoomMutation();
    const isRightDrawerOpen = useSelector(selectRightSidebarOpen);
    const dispatch = useDispatch();
    const { data: roomUsersData, isLoading: roomUsersIsLoading } = useGetUsersForRoomQuery(
        Number(urlParams.id)
    );

    useEffect(() => {
        (async () => {
            if (!isLoading) {
                const room: RoomType = data.room;
                setDetail(room);
                setChipText(room.deleted ? "Deleted" : "Active");
                setChipColor(room.deleted ? "success" : "default");
            }
        })();
    }, [data]);

    const hideDrawer = () => {
        dispatch(hideAddUser());
    };

    useEffect(() => {
        (async () => {})();
    }, [roomUsersData]);

    return (
        <Layout subtitle={`Room detail ( ${urlParams.id} )`} showBack={true}>
            <Grid container pl="24px" pr="24px" spacing={2}>
                <Grid item md={6} m={0} pl={0}>
                    {detail ? (
                        <Paper>
                            <Stack justifyContent="center" alignItems="center" spacing={2} p={1}>
                                <Avatar alt="Remy Sharp" src={detail.avatarUrl} />
                                <Typography component="h1" variant="h6">
                                    {detail.name}
                                </Typography>
                            </Stack>
                            <Stack spacing={1} p={1}>
                                <Typography component="h1" variant="h6">
                                    Details
                                </Typography>
                                <Divider />
                                <Stack spacing={1} p={1} direction="row">
                                    <Typography component="h1" variant="subtitle2">
                                        Type:
                                    </Typography>
                                    <Typography component="h1" variant="body2">
                                        {detail.type}
                                    </Typography>
                                </Stack>
                                <Stack spacing={1} p={1} direction="row">
                                    <Typography component="h1" variant="subtitle2">
                                        Deleted:
                                    </Typography>
                                    <Chip label={chipText} size="small" color={chipColor} />
                                </Stack>
                            </Stack>
                            <Stack justifyContent="center" alignItems="center" spacing={2} p={1}>
                                <Button
                                    color="error"
                                    variant="contained"
                                    onClick={(e) => {
                                        showBasicDialog(
                                            { text: "Please confirm delete." },
                                            async () => {
                                                try {
                                                    await updateRoom({
                                                        roomId: String(urlParams.id),
                                                        data: {
                                                            name: detail.name,
                                                            type: detail.type,
                                                            avatarUrl: detail.avatarUrl,
                                                            deleted: true,
                                                        },
                                                    });
                                                } catch (e) {
                                                    console.error(e);
                                                    showSnackBar({
                                                        severity: "error",
                                                        text: "Server error, please check browser console.",
                                                    });
                                                }
                                            }
                                        );
                                    }}
                                >
                                    Delete
                                </Button>
                            </Stack>
                        </Paper>
                    ) : null}
                </Grid>
                <Grid item md={3} m={0} pl={0}>
                    {urlParams.id && roomUsersData ? (
                        <RoomUsersView roomId={Number(urlParams.id)} roomData={roomUsersData} />
                    ) : null}
                </Grid>
            </Grid>
            <Drawer
                PaperProps={{
                    sx: {
                        backgroundColor: theme.palette.spikaMainBackgroundColor.main,
                    },
                }}
                anchor="right"
                sx={{ zIndex: 1300 }}
                open={isRightDrawerOpen}
                onClose={hideDrawer}
            >
                <Box width={400}>
                    {!roomUsersIsLoading && urlParams ? (
                        <UserListView
                            roomId={Number(urlParams.id)}
                            existedMembers={roomUsersData.room.users}
                        />
                    ) : null}
                </Box>
            </Drawer>
        </Layout>
    );
}
