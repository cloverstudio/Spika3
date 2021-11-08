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
    const [userId, setUserId] = React.useState<formItems>({
        displayName: {
            value: "",
            isError: false,
            helperText: "",
        },
    });

    const [deviceId, setDeviceId] = React.useState<formItems>({
        displayName: {
            value: "",
            isError: false,
            helperText: "",
        },
    });

    const [type, setType] = React.useState<formItems>({
        displayName: {
            value: "",
            isError: false,
            helperText: "",
        },
    });

    const [osName, setOsName] = React.useState<formItems>({
        displayName: {
            value: "",
            isError: false,
            helperText: "",
        },
    });

    const [appVersion, setAppVersion] = React.useState<formItems>({
        displayName: {
            value: "",
            isError: false,
            helperText: "",
        },
    });

    const [token, setToken] = React.useState<formItems>({
        displayName: {
            value: "",
            isError: false,
            helperText: "",
        },
    });

    const [pushToken, setPushToken] = React.useState<formItems>({
        displayName: {
            value: "",
            isError: false,
            helperText: "",
        },
    });

    const post = usePost();

    const validateAndAdd = async () => {
        let hasError = false;

        const newItems: formItems = { ...userId };
        newItems.displayName.isError = false;
        newItems.displayName.helperText = "";

        if (userId.displayName.value.length == 0) {
            userId.displayName.isError = true;
            userId.displayName.helperText = "Please input user id";
            hasError = true;
        }

        if (deviceId.displayName.value.length == 0) {
            deviceId.displayName.isError = true;
            deviceId.displayName.helperText = "Please device id";
            hasError = true;
        }

        if (type.displayName.value.length == 0) {
            type.displayName.isError = true;
            type.displayName.helperText = "Please input type";
            hasError = true;
        }

        if (osName.displayName.value.length == 0) {
            osName.displayName.isError = true;
            osName.displayName.helperText = "Please input os name";
            hasError = true;
        }

        if (appVersion.displayName.value.length == 0) {
            appVersion.displayName.isError = true;
            appVersion.displayName.helperText = "Please input app version";
            hasError = true;
        }

        if (token.displayName.value.length == 0) {
            token.displayName.isError = true;
            token.displayName.helperText = "Please input token";
            hasError = true;
        }

        if (pushToken.displayName.value.length == 0) {
            pushToken.displayName.isError = true;
            pushToken.displayName.helperText = "Please input push token";
            hasError = true;
        }

        if (!hasError) {
            try {
                const result = await post("/api/management/device", {
                    userId: userId.displayName.value,
                    deviceId: deviceId.displayName.value,
                    type: type.displayName.value,
                    osName: osName.displayName.value,
                    appVersion: appVersion.displayName.value,
                    token: token.displayName.value,
                    pushToken: pushToken.displayName.value,
                });

                showSnackBar({ severity: "success", text: "User added" });
                history.push("/device");
                newItems.displayName.value = "";
            } catch (e) {
                console.error(e);
                showSnackBar({
                    severity: "error",
                    text: "Failed to add user, please check console.",
                });
            }
        }

        setUserId(newItems);
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
                            error={userId.displayName.isError}
                            label="User Id"
                            value={userId.displayName.value}
                            onChange={(e) => {
                                userId.displayName.value = e.target.value;
                                setUserId({ ...userId });
                            }}
                            helperText={userId.displayName.helperText}
                        />
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <TextField
                            required
                            fullWidth
                            error={deviceId.displayName.isError}
                            label="Device Id"
                            value={deviceId.displayName.value}
                            onChange={(e) => {
                                deviceId.displayName.value = e.target.value;
                                setDeviceId({ ...deviceId });
                            }}
                            helperText={deviceId.displayName.helperText}
                        />
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <TextField
                            required
                            fullWidth
                            error={type.displayName.isError}
                            label="Type"
                            value={type.displayName.value}
                            onChange={(e) => {
                                type.displayName.value = e.target.value;
                                setType({ ...type });
                            }}
                            helperText={type.displayName.helperText}
                        />
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <TextField
                            required
                            fullWidth
                            error={osName.displayName.isError}
                            label="OS Name"
                            value={osName.displayName.value}
                            onChange={(e) => {
                                osName.displayName.value = e.target.value;
                                setOsName({ ...osName });
                            }}
                            helperText={osName.displayName.helperText}
                        />
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <TextField
                            required
                            fullWidth
                            error={appVersion.displayName.isError}
                            label="App Version"
                            value={appVersion.displayName.value}
                            onChange={(e) => {
                                appVersion.displayName.value = e.target.value;
                                setAppVersion({ ...appVersion });
                            }}
                            helperText={appVersion.displayName.helperText}
                        />
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <TextField
                            required
                            fullWidth
                            error={token.displayName.isError}
                            label="Token"
                            value={token.displayName.value}
                            onChange={(e) => {
                                token.displayName.value = e.target.value;
                                setToken({ ...token });
                            }}
                            helperText={token.displayName.helperText}
                        />
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <TextField
                            required
                            fullWidth
                            error={pushToken.displayName.isError}
                            label="Push Token"
                            value={pushToken.displayName.value}
                            onChange={(e) => {
                                pushToken.displayName.value = e.target.value;
                                setPushToken({ ...pushToken });
                            }}
                            helperText={pushToken.displayName.helperText}
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
