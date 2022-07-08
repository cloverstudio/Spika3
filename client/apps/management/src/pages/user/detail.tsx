import React, { useEffect } from "react";
import Layout from "../layout";
import { useNavigate, useParams } from "react-router-dom";
import { Typography, Paper, Grid, Button, Avatar, Chip, Stack, Divider } from "@mui/material";
import { useGetUserByIdQuery } from "../../api/user";
import UserType from "../../types/User";
import { useShowBasicDialog, useShowSnackBar } from "../../components/useUI";
import { useDeleteUserMutation } from "../../api/user";

export default function Page() {
    const urlParams = useParams();
    const navigate = useNavigate();
    const [detail, setDetail] = React.useState<UserType>();
    const [chipText, setChipText] = React.useState<string>("");
    const [chipColor, setChipColor] = React.useState<"default" | "success">("default");
    const { data, isLoading } = useGetUserByIdQuery(urlParams.id);
    const showSnackBar = useShowSnackBar();
    const showBasicDialog = useShowBasicDialog();
    const [deleteUser, deleteUserMutation] = useDeleteUserMutation();

    useEffect(() => {
        (async () => {
            if (!isLoading) {
                const user: UserType = data.user;
                setDetail(user);
                setChipText(user.verified ? "Verified" : "Unconfirmed");
                setChipColor(user.verified ? "success" : "default");
            }
        })();
    }, [data]);

    return (
        <Layout subtitle={`User detail ( ${urlParams.id} )`} showBack={true}>
            <Grid container ml="24px">
                <Grid item xs={12} md={6} m={0} pl={0}>
                    {detail ? (
                        <Paper>
                            <Stack justifyContent="center" alignItems="center" spacing={2} p={1}>
                                <Avatar alt="Remy Sharp" src={detail.avatarUrl} />
                                <Typography component="h1" variant="h6">
                                    {detail.displayName}
                                </Typography>
                            </Stack>
                            <Stack spacing={1} p={1}>
                                <Typography component="h1" variant="h6">
                                    Details
                                </Typography>
                                <Divider />
                                <Stack spacing={1} p={1} direction="row">
                                    <Typography component="h1" variant="subtitle2">
                                        Phone Number:
                                    </Typography>
                                    <Typography component="h1" variant="body2">
                                        {detail.telephoneNumber}
                                    </Typography>
                                </Stack>
                                <Stack spacing={1} p={1} direction="row">
                                    <Typography component="h1" variant="subtitle2">
                                        Email:
                                    </Typography>
                                    <Typography component="h1" variant="body2">
                                        {detail.emailAddress}
                                    </Typography>
                                </Stack>
                                <Stack spacing={1} p={1} direction="row">
                                    <Typography component="h1" variant="subtitle2">
                                        Verified:
                                    </Typography>
                                    <Chip label={chipText} size="small" color={chipColor} />
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
                                                    navigate(`/user`);
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
