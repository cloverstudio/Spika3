import React, { useEffect } from "react";
import Layout from "../layout";
import { useNavigate, useParams } from "react-router-dom";
import { Typography, Paper, Grid, Button, Stack, Divider } from "@mui/material";
import { formatDate } from "../../../../../lib/utils";
import { useGetDeviceByIdQuery } from "../../api/device";
import DeviceType from "../../types/Device";
import { PhoneIphone } from "@mui/icons-material/";
import { useShowBasicDialog, useShowSnackBar } from "../../components/useUI";
import { useDeleteDeviceMutation } from "../../api/device";

export default function Page() {
    const urlParams = useParams();
    const navigate = useNavigate();
    const [detail, setDetail] = React.useState<DeviceType>();
    const { data, isLoading } = useGetDeviceByIdQuery(urlParams.id);
    const showSnackBar = useShowSnackBar();
    const showBasicDialog = useShowBasicDialog();
    const [deleteUser, deleteUserMutation] = useDeleteDeviceMutation();

    useEffect(() => {
        (async () => {
            if (!isLoading) {
                const user: DeviceType = data.device;
                setDetail(user);
            }
        })();
    }, [data]);

    return (
        <Layout subtitle={`Device detail ( ${urlParams.id} )`} showBack={true}>
            <Grid container ml="24px">
                <Grid item xs={12} md={6} m={0} pl={0}>
                    {detail ? (
                        <Paper>
                            <Stack justifyContent="center" alignItems="center" spacing={2} p={1}>
                                <PhoneIphone />
                                <Typography component="h1" variant="h6">
                                    {detail.deviceName}
                                </Typography>
                            </Stack>
                            <Stack spacing={1} p={1}>
                                <Typography component="h1" variant="h6">
                                    Details
                                </Typography>
                                <Divider />
                                <Stack spacing={1} p={1} direction="row">
                                    <Typography component="h1" variant="subtitle2">
                                        Device Id:
                                    </Typography>
                                    <Typography component="h1" variant="body2">
                                        {detail.deviceId}
                                    </Typography>
                                </Stack>
                                <Stack spacing={1} p={1} direction="row">
                                    <Typography component="h1" variant="subtitle2">
                                        User Id:
                                    </Typography>
                                    <Typography component="h1" variant="body2">
                                        {detail.userId}
                                    </Typography>
                                </Stack>
                                <Stack spacing={1} p={1} direction="row">
                                    <Typography component="h1" variant="subtitle2">
                                        Type:
                                    </Typography>
                                    <Typography component="h1" variant="body2">
                                        {detail.type}
                                    </Typography>
                                </Stack>
                                <Stack spacing={1} p={1} direction="row">
                                    <Typography component="h1" variant="subtitle2">
                                        OS name:
                                    </Typography>
                                    <Typography component="h1" variant="body2">
                                        {detail.osName}
                                    </Typography>
                                </Stack>
                                <Stack spacing={1} p={1} direction="row">
                                    <Typography component="h1" variant="subtitle2">
                                        App Version:
                                    </Typography>
                                    <Typography component="h1" variant="body2">
                                        {detail.appVersion}
                                    </Typography>
                                </Stack>
                                <Stack spacing={1} p={1} direction="row">
                                    <Typography component="h1" variant="subtitle2">
                                        Token:
                                    </Typography>
                                    <Typography component="h1" variant="body2">
                                        {detail.token}
                                    </Typography>
                                </Stack>
                                <Stack spacing={1} p={1} direction="row">
                                    <Typography component="h1" variant="subtitle2">
                                        Push Token:
                                    </Typography>
                                    <Typography component="h1" variant="body2">
                                        {detail.pushToken}
                                    </Typography>
                                </Stack>
                                <Stack spacing={1} p={1} direction="row">
                                    <Typography component="h1" variant="subtitle2">
                                        Token Expired:
                                    </Typography>
                                    <Typography component="h1" variant="body2">
                                        {detail.tokenExpiredAt != null
                                            ? formatDate(detail.tokenExpiredAt)
                                            : ""}
                                    </Typography>
                                </Stack>
                            </Stack>
                            <Stack justifyContent="center" alignItems="center" spacing={2} p={1}>
                                <Button
                                    color="error"
                                    variant="contained"
                                    onClick={(e) => {
                                        showBasicDialog(
                                            { text: "Please confirm delete." },
                                            async () => {
                                                try {
                                                    await deleteUser(urlParams.id);
                                                    navigate(`/device`);
                                                } catch (e) {
                                                    console.error(e);
                                                    showSnackBar({
                                                        severity: "error",
                                                        text: "Server error, please check browser console.",
                                                    });
                                                }
                                            }
                                        );
                                    }}
                                >
                                    Delete
                                </Button>
                            </Stack>
                        </Paper>
                    ) : null}
                </Grid>
            </Grid>
        </Layout>
    );
}
