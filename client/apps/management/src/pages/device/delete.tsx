import React, { useState, useEffect } from "react";
import Layout from "../layout";
import { useHistory, useParams } from "react-router-dom";
import faker from "faker";
import { useGet, useDelete } from "../../lib/useApi";

import { Typography, Paper, Grid, Button } from "@mui/material";

import { useSelector, useDispatch } from "react-redux";
import { useShowBasicDialog, useShowSnackBar } from "../../components/useUI";
import { Device } from "@prisma/client";
import {
    successResponse,
    errorResponse,
    successResponseType,
} from "../../../../../../server/components/response";

interface formItem {
    value: string;
    isError: boolean;
    helperText: string;
}

interface formItems {
    displayName: formItem;
}

export default function Page() {
    const urlParams: { id: string } = useParams();
    const dispatch = useDispatch();
    const history = useHistory();
    const showSnackBar = useShowSnackBar();
    const showBasicDialog = useShowBasicDialog();
    const [detail, setDetail] = React.useState<Device>();

    const callDelete = useDelete();
    const get = useGet();

    useEffect(() => {
        (async () => {
            try {
                const serverResponse: successResponseType = await get(
                    `/api/management/device/${urlParams.id}`
                );
                const response: Device = serverResponse.data.device;
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
        <Layout subtitle={`Delete device ( ${urlParams.id} )`} showBack={true}>
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
                                    <Typography component="dd" className="margin-bottom">
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
                            color="error"
                            variant="contained"
                            onClick={(e) => {
                                showBasicDialog({ text: "Please confirm delete." }, async () => {
                                    try {
                                        await callDelete(`/api/management/device/${urlParams.id}`);
                                        history.push("/device");
                                    } catch (e) {
                                        console.error(e);
                                        showSnackBar({
                                            severity: "error",
                                            text: "Server error, please check browser console.",
                                        });
                                    }
                                });
                            }}
                        >
                            Confirm delete
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Layout>
    );
}
