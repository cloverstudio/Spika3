import React, { useEffect } from "react";
import Layout from "../layout";
import { useNavigate, useParams } from "react-router-dom";
import { Typography, Paper, Grid, Button, Avatar, Checkbox } from "@mui/material";
import { useShowSnackBar } from "../../components/useUI";
import { useGetUserByIdQuery } from "../../api/user";
import UserType from "../../types/User";

export default function Page() {
    const urlParams = useParams();
    const navigate = useNavigate();
    const showSnackBar = useShowSnackBar();
    const [detail, setDetail] = React.useState<UserType>();
    const { data, isLoading } = useGetUserByIdQuery(urlParams.id);

    useEffect(() => {
        (async () => {
            if (!isLoading) {
                const user: UserType = data.user;
                setDetail(user);
            }
        })();
    }, [data]);

    return (
        <Layout subtitle={`User detail ( ${urlParams.id} )`} showBack={true}>
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
                                        ID:
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
                            sx={{ marginRight: "10px" }}
                            variant="contained"
                            onClick={(e) => {
                                navigate(`/user/edit/${urlParams.id}`);
                            }}
                        >
                            Edit
                        </Button>
                        <Button
                            color="error"
                            variant="contained"
                            onClick={(e) => {
                                navigate(`/user/delete/${urlParams.id}`);
                            }}
                        >
                            Delete
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Layout>
    );
}
