import React, { useState, useEffect } from "react";
import Layout from "../layout";
import { useHistory, useParams } from "react-router-dom";
import faker from "faker";
import { useGet, usePut } from "../../lib/useApi";

import { TextField, Paper, Grid, Button, Stack } from "@mui/material";

import { useSelector, useDispatch } from "react-redux";
import { useShowSnackBar } from "../../components/useUI";
import { Device } from "@prisma/client";
import { formItem, formItems } from "./types";

export default function Page() {
    const urlParams: { id: string } = useParams();
    const dispatch = useDispatch();
    const history = useHistory();
    const showSnackBar = useShowSnackBar();
    const [detail, setDetail] = React.useState<Device>();

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

    const get = useGet();
    const put = usePut();

    useEffect(() => {
        (async () => {
            try {
                const response: Device = await get(`/api/management/device/${urlParams.id}`);
                setDetail(response);
                const checkUId = response.userId == null ? "" : response.userId;
                const checkDId = response.deviceId == null ? "" : response.deviceId;
                const checkType = response.type == null ? "" : response.type;
                const checkOsName = response.osName == null ? "" : response.osName;
                const checkAppVersion = response.appVersion == null ? "" : response.appVersion;
                const checkToken = response.token == null ? "" : response.token;
                const checkPushToken = response.pushToken == null ? "" : response.pushToken;
                setUserId({
                    displayName: {
                        value: checkUId,
                        isError: false,
                        helperText: "",
                    },
                });
                setDeviceId({
                    displayName: {
                        value: checkDId,
                        isError: false,
                        helperText: "",
                    },
                });
                setType({
                    displayName: {
                        value: checkType,
                        isError: false,
                        helperText: "",
                    },
                });
                setOsName({
                    displayName: {
                        value: checkOsName,
                        isError: false,
                        helperText: "",
                    },
                });
                setAppVersion({
                    displayName: {
                        value: checkAppVersion,
                        isError: false,
                        helperText: "",
                    },
                });
                setToken({
                    displayName: {
                        value: checkToken,
                        isError: false,
                        helperText: "",
                    },
                });
                setPushToken({
                    displayName: {
                        value: checkPushToken,
                        isError: false,
                        helperText: "",
                    },
                });
            } catch (e) {
                console.error(e);
                showSnackBar({
                    severity: "error",
                    text: "Server error, please check browser console.",
                });
            }
        })();
    }, []);

    const validateAndUpdate = async () => {
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
                const result = await put(`/api/management/device/${urlParams.id}`, {
                    userId: userId.displayName.value,
                    deviceId: deviceId.displayName.value,
                    type: type.displayName.value,
                    osName: osName.displayName.value,
                    appVersion: appVersion.displayName.value,
                    token: token.displayName.value,
                    pushToken: pushToken.displayName.value,
                });

                showSnackBar({ severity: "success", text: "Device updated" });
                history.push("/device");
                newItems.displayName.value = "";
            } catch (e) {
                console.error(e);
                showSnackBar({
                    severity: "error",
                    text: "Failed to update device, please check console.",
                });
            }
        }

        setUserId(newItems);
    };

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
                        <Stack alignItems="center" spacing={1} direction="row">
                            <TextField
                                required
                                error={deviceId.displayName.isError}
                                label="Device Id"
                                value={deviceId.displayName.value}
                                onChange={(e) => {
                                    deviceId.displayName.value = e.target.value;
                                    setDeviceId({ ...deviceId });
                                }}
                                helperText={deviceId.displayName.helperText}
                            />
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
                        </Stack>
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
                                validateAndUpdate();
                            }}
                        >
                            Update device
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Layout>
    );
}
