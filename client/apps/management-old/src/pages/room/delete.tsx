import React, { useEffect } from "react";
import Layout from "../layout";
import { useNavigate, useParams } from "react-router-dom";
import { Typography, Paper, Grid, Button, Avatar, Checkbox } from "@mui/material";
import { useShowBasicDialog, useShowSnackBar } from "../../components/useUI";
import { useGetRoomByIdQuery, useUpdateRoomMutation } from "../../api/room";
import RoomType from "../../types/Room";

export default function Page() {
    const urlParams = useParams();
    const navigate = useNavigate();
    const showSnackBar = useShowSnackBar();
    const showBasicDialog = useShowBasicDialog();
    const [detail, setDetail] = React.useState<RoomType>();
    const { data, isLoading } = useGetRoomByIdQuery(urlParams.id);
    const [deleteRoom, deleteRoomMutation] = useUpdateRoomMutation();

    useEffect(() => {
        (async () => {
            if (!isLoading) {
                const response: RoomType = data.room;
                setDetail(response);
            }
        })();
    }, [data]);

    return (
        <Layout subtitle={`Delete room ( ${urlParams.id} )`} showBack={true}>
            <Paper
                sx={{
                    margin: "24px",
                    padding: "24px",
                    minHeight: "calc(100vh-64px)",
                }}
            >
                {detail ? (
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={8}>
                            <Grid
                                container
                                component="dl" // mount a Definition List
                                spacing={2}
                            >
                                <Grid item>
                                    <Typography component="dt" variant="h6">
                                        ID:
                                    </Typography>
                                    <Typography component="dd" marginBottom={10}>
                                        {detail.id}
                                    </Typography>
                                    <Typography component="dt" variant="h6">
                                        Avatar
                                    </Typography>
                                    <Avatar alt="Remy Sharp" src={detail.avatarUrl} />
                                    <Typography component="dt" variant="h6">
                                        Name
                                    </Typography>
                                    <Typography component="dd">{detail.name}</Typography>
                                    <Typography component="dt" variant="h6">
                                        Type
                                    </Typography>
                                    <Typography component="dd">{detail.type}</Typography>
                                    <Typography component="dt" variant="h6">
                                        Avatar Url
                                    </Typography>
                                    <Typography component="dd">{detail.avatarUrl}</Typography>
                                    <Typography component="dt" variant="h6">
                                        Deleted
                                    </Typography>
                                    <Checkbox checked={detail.deleted} />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12} md={8} textAlign="right">
                            <Button
                                color="error"
                                variant="contained"
                                onClick={(e) => {
                                    showBasicDialog(
                                        { text: "Please confirm delete." },
                                        async () => {
                                            try {
                                                await deleteRoom({
                                                    roomId: urlParams.id,
                                                    data: {
                                                        name: detail.name,
                                                        type: detail.type,
                                                        avatarUrl: detail.avatarUrl,
                                                        deleted: true,
                                                    },
                                                });
                                                navigate("/room");
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
                                Confirm delete
                            </Button>
                        </Grid>
                    </Grid>
                ) : null}
            </Paper>
        </Layout>
    );
}
