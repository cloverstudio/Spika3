import React from "react";
import Layout from "../layout";
import { useHistory } from "react-router-dom";
import { useGet, usePost } from "../../lib/useApi";
import { TextField, Paper, Grid, Button } from "@mui/material";
import { useShowSnackBar } from "../../components/useUI";
import * as yup from "yup";
import { useFormik } from "formik";

const deviceModelSchema = yup.object({
    userId: yup.number().required("User id is required"),
    deviceId: yup.string().required("Device id is required"),
    type: yup.string(),
    osName: yup.string(),
    appVersion: yup.string(),
    token: yup.string(),
    pushToken: yup.string(),
});

export default function Dashboard() {
    const navigate = useNavigate();
    const showSnackBar = useShowSnackBar();
    const [addDevice, addDeviceMutation] = useCreateDeviceMutation();
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
            validateAndAdd();
        },
    });

    const validateAndAdd = async () => {
        try {
            await addDevice({
                userId: formik.values.userId,
                deviceId: formik.values.deviceId,
                type: formik.values.type,
                osName: formik.values.osName,
                appVersion: formik.values.appVersion,
                token: formik.values.token,
                pushToken: formik.values.pushToken,
            });

            showSnackBar({ severity: "success", text: "Device added" });
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
                    Add Device
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
                    size="small"
                    inputProps={{ style: { fontSize: 15 } }}
                    InputLabelProps={{ style: { fontSize: 15 } }}
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
                        Add new device
                    </Button>
                    <Button variant="outlined" color="spikaGrey" onClick={() => dispatch(hide())}>
                        Cancel
                    </Button>
                </Stack>
            </Stack>
        </form>
    );
}
