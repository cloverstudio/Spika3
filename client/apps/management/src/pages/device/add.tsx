import React, { useState, useEffect } from "react";
import Layout from "../layout";
import { useHistory } from "react-router-dom";
import faker from "faker";
import { usePost } from "../../lib/useApi";

import { TextField, Paper, Grid, Button, Stack } from "@mui/material";

import { useSelector, useDispatch } from "react-redux";
import { useShowSnackBar } from "../../components/useUI";
import { formItem, formItems } from "./types";

function validateEmail(email: any) {
    const re =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

export default function Dashboard() {
    const dispatch = useDispatch();
    const history = useHistory();
    const showSnackBar = useShowSnackBar();
    const [name, setName] = React.useState<string>("");
    const [forms, setForms] = React.useState<formItems>({
        userId: {
            value: "",
            isError: false,
            helperText: "",
        },
        deviceId: {
            value: "",
            isError: false,
            helperText: "",
        },
        type: {
            value: "",
            isError: false,
            helperText: "",
        },
        osName: {
            value: "",
            isError: false,
            helperText: "",
        },
        appVersion: {
            value: "",
            isError: false,
            helperText: "",
        },
        token: {
            value: "",
            isError: false,
            helperText: "",
        },
        pushToken: {
            value: "",
            isError: false,
            helperText: "",
        },
    });

    const post = usePost();

    const validateAndAdd = async () => {
        let hasError = false;

        const newItems: formItems = { ...forms };
        newItems.userId.isError = false;
        newItems.userId.helperText = "";
        newItems.deviceId.isError = false;
        newItems.deviceId.helperText = "";
        newItems.type.isError = false;
        newItems.type.helperText = "";
        newItems.osName.isError = false;
        newItems.osName.helperText = "";
        newItems.appVersion.isError = false;
        newItems.appVersion.helperText = "";
        newItems.token.isError = false;
        newItems.token.helperText = "";
        newItems.pushToken.isError = false;
        newItems.pushToken.helperText = "";

        if (forms.userId.value.length == 0) {
            forms.userId.isError = true;
            forms.userId.helperText = "Please input user id";
            hasError = true;
        }

        if (forms.deviceId.value.length == 0) {
            forms.deviceId.isError = true;
            forms.deviceId.helperText = "Please device id";
            hasError = true;
        }

        if (forms.type.value.length == 0) {
            forms.type.isError = true;
            forms.type.helperText = "Please input type";
            hasError = true;
        }

        if (forms.osName.value.length == 0) {
            forms.osName.isError = true;
            forms.osName.helperText = "Please input os name";
            hasError = true;
        }

        if (forms.appVersion.value.length == 0) {
            forms.appVersion.isError = true;
            forms.appVersion.helperText = "Please input app version";
            hasError = true;
        }

        if (forms.token.value.length == 0) {
            forms.token.isError = true;
            forms.token.helperText = "Please input token";
            hasError = true;
        }

        if (forms.pushToken.value.length == 0) {
            forms.pushToken.isError = true;
            forms.pushToken.helperText = "Please input push token";
            hasError = true;
        }

        if (!hasError) {
            try {
                const result = await post("/api/management/device", {
                    userId: forms.userId.value,
                    deviceId: forms.deviceId.value,
                    type: forms.type.value,
                    osName: forms.osName.value,
                    appVersion: forms.appVersion.value,
                    token: forms.token.value,
                    pushToken: forms.pushToken.value,
                });

                showSnackBar({ severity: "success", text: "User added" });
                history.push("/device");
            } catch (e) {
                console.error(e);
                showSnackBar({
                    severity: "error",
                    text: "Failed to add user, please check console.",
                });
            }
        }

        setForms(newItems);
    };

    return (
        <Layout subtitle="Add new device" showBack={true}>
            <Paper
                sx={{
                    margin: "24px",
                    padding: "24px",
                    minHeight: "calc(100vh-64px)",
                }}
            >
                <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                        <TextField
                            required
                            fullWidth
                            error={forms.userId.isError}
                            label="User Id"
                            value={forms.userId.value}
                            onChange={(e) => {
                                forms.userId.value = e.target.value;
                                setForms({ ...forms });
                            }}
                            helperText={forms.userId.helperText}
                        />
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <TextField
                            required
                            fullWidth
                            error={forms.deviceId.isError}
                            label="Device Id"
                            value={forms.deviceId.value}
                            onChange={(e) => {
                                forms.deviceId.value = e.target.value;
                                setForms({ ...forms });
                            }}
                            helperText={forms.deviceId.helperText}
                        />
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <TextField
                            required
                            fullWidth
                            error={forms.type.isError}
                            label="Type"
                            value={forms.type.value}
                            onChange={(e) => {
                                forms.type.value = e.target.value;
                                setForms({ ...forms });
                            }}
                            helperText={forms.type.helperText}
                        />
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <TextField
                            required
                            fullWidth
                            error={forms.osName.isError}
                            label="OS Name"
                            value={forms.osName.value}
                            onChange={(e) => {
                                forms.osName.value = e.target.value;
                                setForms({ ...forms });
                            }}
                            helperText={forms.osName.helperText}
                        />
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <TextField
                            required
                            fullWidth
                            error={forms.appVersion.isError}
                            label="App Version"
                            value={forms.appVersion.value}
                            onChange={(e) => {
                                forms.appVersion.value = e.target.value;
                                setForms({ ...forms });
                            }}
                            helperText={forms.appVersion.helperText}
                        />
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <TextField
                            required
                            fullWidth
                            error={forms.token.isError}
                            label="Token"
                            value={forms.token.value}
                            onChange={(e) => {
                                forms.token.value = e.target.value;
                                setForms({ ...forms });
                            }}
                            helperText={forms.token.helperText}
                        />
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <TextField
                            required
                            fullWidth
                            error={forms.pushToken.isError}
                            label="Push Token"
                            value={forms.pushToken.value}
                            onChange={(e) => {
                                forms.pushToken.value = e.target.value;
                                setForms({ ...forms });
                            }}
                            helperText={forms.pushToken.helperText}
                        />
                    </Grid>
                    <Grid item xs={12} md={8} textAlign="right">
                        <Button
                            variant="contained"
                            onClick={(e) => {
                                validateAndAdd();
                            }}
                        >
                            Add new device
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Layout>
    );
}
