import React, { useEffect } from "react";
import Layout from "../layout";
import { useNavigate, useParams } from "react-router-dom";
import { useGet } from "../../lib/useApi";
import { Typography, Paper, Grid, Button } from "@mui/material";
import { useShowSnackBar } from "../../components/useUI";
import { Device } from "@prisma/client";
import { successResponseType } from "../../../../../../server/components/response";

export default function Page() {
    const urlParams = useParams();
    const navigate = useNavigate();
    const showSnackBar = useShowSnackBar();
    const [detail, setDetail] = React.useState<Device>();

    const get = useGet();

    useEffect(() => {
        (async () => {
            try {
                const serverResponse: successResponseType = await get(
                    `/management/device/${urlParams.id}`
                );
                const response: Device = serverResponse.data;
                setDetail(response);
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
        <Layout subtitle={`Device detail ( ${urlParams.id} )`} showBack={true}>
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
                                        Device Id
                                    </Typography>
                                    <Typography component="dd">{detail.deviceId}</Typography>
                                    <Typography component="dt" variant="h6">
                                        User Id
                                    </Typography>
                                    <Typography component="dd">{detail.userId}</Typography>
                                    <Typography component="dt" variant="h6">
                                        Type
                                    </Typography>
                                    <Typography component="dd">{detail.type}</Typography>
                                    <Typography component="dt" variant="h6">
                                        OS name
                                    </Typography>
                                    <Typography component="dd">{detail.osName}</Typography>
                                    <Typography component="dt" variant="h6">
                                        App Version
                                    </Typography>
                                    <Typography component="dd">{detail.appVersion}</Typography>
                                    <Typography component="dt" variant="h6">
                                        Token
                                    </Typography>
                                    <Typography component="dd">{detail.token}</Typography>
                                    <Typography component="dt" variant="h6">
                                        Push Token
                                    </Typography>
                                    <Typography component="dd">{detail.pushToken}</Typography>
                                    <Typography component="dt" variant="h6">
                                        Token Expired
                                    </Typography>
                                    <Typography component="dd">{detail.tokenExpiredAt}</Typography>
                                </Grid>
                            </Grid>
                        ) : null}
                    </Grid>
                    <Grid item xs={12} md={8} textAlign="right">
                        <Button
                            sx={{ marginRight: "1em" }}
                            variant="contained"
                            onClick={(e) => {
                                navigate(`/device/edit/${urlParams.id}`);
                            }}
                        >
                            Edit
                        </Button>
                        <Button
                            color="error"
                            variant="contained"
                            onClick={(e) => {
                                navigate(`/device/delete/${urlParams.id}`);
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
