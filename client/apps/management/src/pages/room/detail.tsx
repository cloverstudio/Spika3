import React, { useEffect } from "react";
import Layout from "../layout";
import { useNavigate, useParams } from "react-router-dom";
import { Typography, Paper, Grid, Button, Avatar, Checkbox } from "@mui/material";
import { useShowSnackBar } from "../../components/useUI";
import { useGetRoomByIdQuery } from "../../api/room";
import RoomType from "../../types/Room";

export default function Page() {
    const urlParams = useParams();
    const navigate = useNavigate();
    const showSnackBar = useShowSnackBar();
    const [detail, setDetail] = React.useState<RoomType>();
    const { data, isLoading } = useGetRoomByIdQuery(urlParams.id);

    useEffect(() => {
        (async () => {
            if (!isLoading) {
                const user: RoomType = data.room;
                setDetail(user);
            }
        })();
    }, [data]);

    return (
        <Layout subtitle={`Room detail ( ${urlParams.id} )`} showBack={true}>
            <Paper
                sx={{
                    margin: "24px",
                    padding: "24px",
                    minHeight: "calc(100vh-64px)",
                }}
            >
                <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                        {detail ? (
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
                        ) : null}
                    </Grid>
                    <Grid item xs={12} md={8} textAlign="right">
                        <Button
                            sx={{ marginRight: "10px" }}
                            variant="contained"
                            onClick={(e) => {
                                navigate(`/room/edit/${urlParams.id}`);
                            }}
                        >
                            Edit
                        </Button>
                        <Button
                            color="error"
                            variant="contained"
                            onClick={(e) => {
                                navigate(`/room/delete/${urlParams.id}`);
                            }}
                        >
                            Delete
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Layout>
    );
}
