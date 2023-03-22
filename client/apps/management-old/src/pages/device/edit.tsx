import React, { useEffect } from "react";
import Layout from "../layout";
import { useNavigate, useParams } from "react-router-dom";
import { TextField, Stack, Grid, Button, Typography } from "@mui/material";
import { useShowSnackBar } from "../../components/useUI";
import * as yup from "yup";
import { useFormik } from "formik";
import { useGetDeviceByIdQuery, useUpdateDeviceMutation } from "../../api/device";
import DeviceType from "../../types/Device";
import { hide } from "../../store/rightDrawerSlice";
import { useDispatch } from "react-redux";

const deviceModelSchema = yup.object({
    userId: yup.number().required("User id is required"),
    deviceId: yup.string().required("Device id is required"),
    type: yup.string(),
    osName: yup.string(),
    appVersion: yup.number(),
    token: yup.string(),
    pushToken: yup.string(),
});

type EditDeviceProps = {
    deviceId: string;
};

export default function Page(props: EditDeviceProps) {
    const { deviceId } = props;
    const urlParams = useParams();
    const navigate = useNavigate();
    const showSnackBar = useShowSnackBar();
    const { data, isLoading } = useGetDeviceByIdQuery(deviceId);
    const [updateDevice, updateDeviceMutation] = useUpdateDeviceMutation();
    const dispatch = useDispatch();

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
            if (!isLoading) {
                const response: DeviceType = data.device;
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
            }
        })();
    }, [data]);

    const validateAndUpdate = async () => {
        try {
            await updateDevice({
                deviceId: deviceId,
                data: {
                    id: serverDevice.values.id,
                    userId: formik.values.userId,
                    deviceId: formik.values.deviceId,
                    type: formik.values.type,
                    osName: formik.values.osName,
                    appVersion: formik.values.appVersion,
                    token: formik.values.token,
                    pushToken: formik.values.pushToken,
                },
            });
            showSnackBar({ severity: "success", text: "Device updated" });
            dispatch(hide());
        } catch (e: any) {
            console.error(e);
            showSnackBar({
                severity: "error",
                text: String(e.message),
            });
        }
    };

    return (
        <form onSubmit={formik.handleSubmit}>
            <Stack spacing={2} padding={2}>
                <Typography component="h1" variant="subtitle1" noWrap style={{ color: "grey" }}>
                    Edit User
                </Typography>
                <TextField
                    required
                    fullWidth
                    id="userId"
                    error={formik.touched.userId && Boolean(formik.errors.userId)}
                    label="User Id"
                    value={formik.values.userId}
                    onChange={formik.handleChange}
                    helperText={formik.touched.userId && formik.errors.userId}
                    size="small"
                    inputProps={{ style: { fontSize: 15 } }}
                    InputLabelProps={{ style: { fontSize: 15 } }}
                />
                <TextField
                    required
                    fullWidth
                    id="deviceId"
                    error={formik.touched.deviceId && Boolean(formik.errors.deviceId)}
                    label="Device Id"
                    value={formik.values.deviceId}
                    onChange={formik.handleChange}
                    helperText={formik.touched.deviceId && formik.errors.deviceId}
                    size="small"
                    inputProps={{ style: { fontSize: 15 } }}
                    InputLabelProps={{ style: { fontSize: 15 } }}
                />
                <TextField
                    fullWidth
                    id="type"
                    error={formik.touched.type && Boolean(formik.errors.type)}
                    label="Type"
                    value={formik.values.type}
                    onChange={formik.handleChange}
                    helperText={formik.touched.type && formik.errors.type}
                    size="small"
                    inputProps={{ style: { fontSize: 15 } }}
                    InputLabelProps={{ style: { fontSize: 15 } }}
                />
                <TextField
                    fullWidth
                    id="osName"
                    error={formik.touched.osName && Boolean(formik.errors.osName)}
                    label="Os Name"
                    value={formik.values.osName}
                    onChange={formik.handleChange}
                    helperText={formik.touched.osName && formik.errors.osName}
                    size="small"
                    inputProps={{ style: { fontSize: 15 } }}
                    InputLabelProps={{ style: { fontSize: 15 } }}
                />
                <TextField
                    fullWidth
                    id="appVersion"
                    error={formik.touched.appVersion && Boolean(formik.errors.appVersion)}
                    label="App version"
                    value={formik.values.appVersion}
                    onChange={formik.handleChange}
                    helperText={formik.touched.appVersion && formik.errors.appVersion}
                    size="small"
                    inputProps={{ style: { fontSize: 15 } }}
                    InputLabelProps={{ style: { fontSize: 15 } }}
                />
                <TextField
                    fullWidth
                    id="token"
                    error={formik.touched.token && Boolean(formik.errors.token)}
                    label="Token"
                    value={formik.values.token}
                    onChange={formik.handleChange}
                    helperText={formik.touched.token && formik.errors.token}
                />
                <TextField
                    fullWidth
                    id="pushToken"
                    error={formik.touched.pushToken && Boolean(formik.errors.pushToken)}
                    label="Push token"
                    value={formik.values.pushToken}
                    onChange={formik.handleChange}
                    helperText={formik.touched.pushToken && formik.errors.pushToken}
                    size="small"
                    inputProps={{ style: { fontSize: 15 } }}
                    InputLabelProps={{ style: { fontSize: 15 } }}
                />
                <Stack spacing={2} direction="row">
                    <Button variant="contained" type="submit" color="spikaButton">
                        Update device
                    </Button>
                    <Button variant="outlined" color="spikaGrey" onClick={() => dispatch(hide())}>
                        Cancel
                    </Button>
                </Stack>
            </Stack>
        </form>
    );
}
