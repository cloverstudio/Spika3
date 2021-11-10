import React, { useState, useEffect } from "react";
import Layout from "../layout";
import { useHistory, useParams } from "react-router-dom";
import faker from "faker";
import { useGet, useDelete } from "../../lib/useApi";

import { Typography, Paper, Grid, Button, Avatar, Checkbox } from "@mui/material";

import { useSelector, useDispatch } from "react-redux";
import { useShowBasicDialog, useShowSnackBar } from "../../components/useUI";
import { User } from "@prisma/client";

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
    const [detail, setDetail] = React.useState<User>();

    const callDelete = useDelete();
    const get = useGet();

    useEffect(() => {
        (async () => {
            try {
                const response: User = await get(`/api/management/user/${urlParams.id}`);
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
        <Layout subtitle={`Delete user ( ${urlParams.id} )`} showBack={true}>
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
                                        ID
                                    </Typography>
                                    <Typography component="dd" className="margin-bottom">
                                        {detail.id}
                                    </Typography>
                                    <Typography component="dt" variant="h6">
                                        Avatar
                                    </Typography>
                                    <Avatar alt="Remy Sharp" src={detail.avatarUrl} />
                                    <Typography component="dt" variant="h6">
                                        Display Name
                                    </Typography>
                                    <Typography component="dd">{detail.displayName}</Typography>
                                    <Typography component="dt" variant="h6">
                                        Country Code
                                    </Typography>
                                    <Typography component="dd">{detail.countryCode}</Typography>
                                    <Typography component="dt" variant="h6">
                                        Phone Number
                                    </Typography>
                                    <Typography component="dd">{detail.telephoneNumber}</Typography>
                                    <Typography component="dt" variant="h6">
                                        E-mail
                                    </Typography>
                                    <Typography component="dd">{detail.emailAddress}</Typography>
                                    <Typography component="dt" variant="h6">
                                        Avatar Url
                                    </Typography>
                                    <Typography component="dd">{detail.avatarUrl}</Typography>
                                    <Typography component="dt" variant="h6">
                                        Verification Code
                                    </Typography>
                                    <Typography component="dd">
                                        {detail.verificationCode}
                                    </Typography>
                                    <Typography component="dt" variant="h6">
                                        Verified
                                    </Typography>
                                    <Checkbox checked={detail.verified} />
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
                                        await callDelete(`/api/management/user/${urlParams.id}`);
                                        history.push("/user");
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
