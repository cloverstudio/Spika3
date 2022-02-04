import React, { useEffect } from "react";
import Layout from "../layout";
import { useNavigate, useParams } from "react-router-dom";
import { useGet, usePut } from "../../lib/useApi";
import { TextField, Paper, Grid, Button } from "@mui/material";
import { useShowSnackBar } from "../../components/useUI";
import { Device } from "@prisma/client";
import * as yup from "yup";
import { useFormik } from "formik";
import { successResponseType } from "../../../../../../server/components/response";

const deviceModelSchema = yup.object({
    userId: yup.number().required("User id is required"),
    deviceId: yup.string().required("Device id is required"),
    type: yup.string(),
    osName: yup.string(),
    appVersion: yup.number(),
    token: yup.string(),
    pushToken: yup.string(),
});

export default function Page() {
    const urlParams = useParams();
    const navigate = useNavigate();
    const showSnackBar = useShowSnackBar();

    const get = useGet();
    const put = usePut();

    const formik = useFormik({
        initialValues: {
            userId: "",
            deviceId: "",
            type: "",
            osName: "",
            appVersion: "",
            token: "",
            pushToken: "",
        },
        validationSchema: deviceModelSchema,
        onSubmit: (values) => {
            validateAndUpdate();
        },
    });

    const serverDevice = useFormik({
        initialValues: {
            id: 0,
            userId: "",
            deviceId: "",
            type: "",
            osName: "",
            appVersion: "",
            token: "",
            pushToken: "",
        },
        validationSchema: deviceModelSchema,
        onSubmit: (values) => {},
    });

    useEffect(() => {
        (async () => {
            try {
                const serverResponse: successResponseType = await get(
                    `/api/management/device/${urlParams.id}`
                );
                const response: Device = serverResponse.data.device;
                const checkUId = response.userId == null ? "" : response.userId;
                const checkDId = response.deviceId == null ? "" : response.deviceId;
                const checkType = response.type == null ? "" : response.type;
                const checkOsName = response.osName == null ? "" : response.osName;
                const checkAppVersion = response.appVersion == null ? "" : response.appVersion;
                const checkToken = response.token == null ? "" : response.token;
                const checkPushToken = response.pushToken == null ? "" : response.pushToken;
                formik.setValues({
                    userId: String(checkUId),
                    deviceId: checkDId,
                    type: checkType,
                    osName: checkOsName,
                    appVersion: String(checkAppVersion),
                    token: checkToken,
                    pushToken: checkPushToken,
                });
                serverDevice.setValues({
                    id: response.id,
                    userId: String(checkUId),
                    deviceId: checkDId,
                    type: checkType,
                    osName: checkOsName,
                    appVersion: String(checkAppVersion),
                    token: checkToken,
                    pushToken: checkPushToken,
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
        try {
            const result = await put(`/api/management/device/${urlParams.id}`, {
                id: serverDevice.values.id,
                userId: formik.values.userId,
                deviceId: formik.values.deviceId,
                type: formik.values.type,
                osName: formik.values.osName,
                appVersion: formik.values.appVersion,
                token: formik.values.token,
                pushToken: formik.values.pushToken,
            });

            showSnackBar({ severity: "success", text: "Device updated" });
            navigate("/device");
        } catch (e: any) {
            console.error(e);
            showSnackBar({
                severity: "error",
                text: String(e.message),
            });
        }
    };

    return (
        <Layout subtitle={`Device detail ( ${urlParams.id} )`} showBack={true}>
            <form onSubmit={formik.handleSubmit}>
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
                                id="userId"
                                error={formik.touched.userId && Boolean(formik.errors.userId)}
                                label="User Id"
                                value={formik.values.userId}
                                onChange={formik.handleChange}
                                helperText={formik.touched.userId && formik.errors.userId}
                            />
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <TextField
                                required
                                fullWidth
                                id="deviceId"
                                error={formik.touched.deviceId && Boolean(formik.errors.deviceId)}
                                label="Device Id"
                                value={formik.values.deviceId}
                                onChange={formik.handleChange}
                                helperText={formik.touched.deviceId && formik.errors.deviceId}
                            />
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <TextField
                                fullWidth
                                id="type"
                                error={formik.touched.type && Boolean(formik.errors.type)}
                                label="Type"
                                value={formik.values.type}
                                onChange={formik.handleChange}
                                helperText={formik.touched.type && formik.errors.type}
                            />
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <TextField
                                fullWidth
                                id="osName"
                                error={formik.touched.osName && Boolean(formik.errors.osName)}
                                label="Os Name"
                                value={formik.values.osName}
                                onChange={formik.handleChange}
                                helperText={formik.touched.osName && formik.errors.osName}
                            />
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <TextField
                                fullWidth
                                id="appVersion"
                                error={
                                    formik.touched.appVersion && Boolean(formik.errors.appVersion)
                                }
                                label="App version"
                                value={formik.values.appVersion}
                                onChange={formik.handleChange}
                                helperText={formik.touched.appVersion && formik.errors.appVersion}
                            />
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <TextField
                                fullWidth
                                id="token"
                                error={formik.touched.token && Boolean(formik.errors.token)}
                                label="Token"
                                value={formik.values.token}
                                onChange={formik.handleChange}
                                helperText={formik.touched.token && formik.errors.token}
                            />
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <TextField
                                fullWidth
                                id="pushToken"
                                error={formik.touched.pushToken && Boolean(formik.errors.pushToken)}
                                label="Push token"
                                value={formik.values.pushToken}
                                onChange={formik.handleChange}
                                helperText={formik.touched.pushToken && formik.errors.pushToken}
                            />
                        </Grid>
                        <Grid item xs={12} md={8} textAlign="right">
                            <Button variant="contained" type="submit">
                                Update device
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </form>
        </Layout>
    );
}
