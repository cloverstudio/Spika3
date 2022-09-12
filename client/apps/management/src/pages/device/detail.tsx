import React, { useEffect } from "react";
import Layout from "../layout";
import { useHistory, useParams } from "react-router-dom";
import { useGet } from "../../lib/useApi";
import { Typography, Paper, Grid, Button } from "@mui/material";
import { useShowSnackBar } from "../../components/useUI";
import { Device } from "@prisma/client";
import { successResponseType } from "../../../../../../server/components/response";

export default function Page() {
    const urlParams: { id: string } = useParams();
    const history = useHistory();
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
