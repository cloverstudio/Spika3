import React, { useEffect } from "react";
import Layout from "../layout";
import { useHistory, useParams } from "react-router-dom";
import { useGet, useDelete } from "../../lib/useApi";
import { Typography, Paper, Grid, Button, Avatar, Checkbox } from "@mui/material";
import { useShowBasicDialog, useShowSnackBar } from "../../components/useUI";
import { User } from "@prisma/client";
import { successResponseType } from "../../../../../../server/components/response";

export default function Page() {
    const urlParams: { id: string } = useParams();
    const history = useHistory();
    const showSnackBar = useShowSnackBar();
    const showBasicDialog = useShowBasicDialog();
    const [detail, setDetail] = React.useState<UserType>();
    const { data, isLoading } = useGetUserByIdQuery(urlParams.id);
    const [deleteUser, deleteUserMutation] = useDeleteUserMutation();

    useEffect(() => {
        (async () => {
            if (!isLoading) {
                const response: UserType = data.user;
                setDetail(response);
            }
        })();
    }, [data]);

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
                                    <Typography component="dd" marginBottom={10}>
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
                                        await deleteUser(urlParams.id);
                                        navigate("/user");
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
