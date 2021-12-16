import React, { useEffect } from "react";
import Layout from "../layout";
import { useHistory, useParams } from "react-router-dom";
import { useGet } from "../../lib/useApi";
import { Typography, Paper, Grid, Button, Avatar, Checkbox } from "@mui/material";
import { useShowSnackBar } from "../../components/useUI";
import { Room } from "@prisma/client";
import { successResponseType } from "../../../../../../server/components/response";

export default function Page() {
    const urlParams: { id: string } = useParams();
    const history = useHistory();
    const showSnackBar = useShowSnackBar();
    const [detail, setDetail] = React.useState<Room>();

    const get = useGet();

    useEffect(() => {
        (async () => {
            try {
                const response: successResponseType = await get(
                    `/api/management/room/${urlParams.id}`
                );
                const room: Room = response.data.room;
                setDetail(room);
            } catch (e) {
                console.error(e);
                showSnackBar({
                    severity: "error",
                    text: "Server error, please check browser console.",
                });
            }
        })();
    }, []);

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
                                history.push(`/room/edit/${urlParams.id}`);
                            }}
                        >
                            Edit
                        </Button>
                        <Button
                            color="error"
                            variant="contained"
                            onClick={(e) => {
                                history.push(`/room/delete/${urlParams.id}`);
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
