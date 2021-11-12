import React, { useState, useEffect } from "react";
import Layout from "../layout";
import { useHistory } from "react-router-dom";
import faker from "faker";
import { usePost } from "../../lib/useApi";

import {
    TextField,
    Paper,
    Grid,
    Button,
    Stack,
    Checkbox,
    FormGroup,
    FormControl,
    FormControlLabel,
} from "@mui/material";

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
    const [forms, setForms] = React.useState<formItems>({
        displayName: {
            value: "",
            isError: false,
            helperText: "",
        },
        phoneNumber: {
            value: "",
            isError: false,
            helperText: "",
        },
        countryCode: {
            value: "",
            isError: false,
            helperText: "",
        },
        email: {
            value: "",
            isError: false,
            helperText: "",
        },
        avatarUrl: {
            value: "",
            isError: false,
            helperText: "",
        },
        verified: {
            value: "",
            isError: false,
            helperText: "",
        },
    });

    const [verified, setVerified] = React.useState<boolean>(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setVerified(event.target.checked);
    };

    const post = usePost();

    const validateAndAdd = async () => {
        let hasError = false;

        const newItems: formItems = { ...forms };
        newItems.displayName.isError = false;
        newItems.displayName.helperText = "";
        newItems.countryCode.isError = false;
        newItems.countryCode.helperText = "";
        newItems.phoneNumber.isError = false;
        newItems.phoneNumber.helperText = "";

        if (forms.displayName.value.length == 0) {
            forms.displayName.isError = true;
            forms.displayName.helperText = "Please input display name";
            hasError = true;
        }

        if (forms.countryCode.value.length == 0) {
            forms.countryCode.isError = true;
            forms.countryCode.helperText = "Please input country code";
            hasError = true;
        }

        if (forms.phoneNumber.value.length == 0) {
            forms.phoneNumber.isError = true;
            forms.phoneNumber.helperText = "Please input phone number";
            hasError = true;
        }

        if (!hasError) {
            try {
                const result = await post("/api/management/user", {
                    displayName: forms.displayName.value,
                    emailAddress: forms.email.value,
                    countryCode: forms.countryCode.value,
                    telephoneNumber: forms.phoneNumber.value,
                    avatarUrl: forms.avatarUrl.value,
                    verified: verified,
                });

                showSnackBar({ severity: "success", text: "User added" });
                history.push("/user");
            } catch (e) {
                console.error(e);
                showSnackBar({
                    severity: "error",
                    text: "Failed to add user, please check console.",
                });
            }
        }

        setForms(newItems);
    };

    return (
        <Layout subtitle="Add new user" showBack={true}>
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
                            error={forms.displayName.isError}
                            label="Display Name"
                            value={forms.displayName.value}
                            onChange={(e) => {
                                forms.displayName.value = e.target.value;
                                setForms({ ...forms });
                            }}
                            helperText={forms.displayName.helperText}
                        />
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Stack alignItems="center" spacing={1} direction="row">
                            <TextField
                                required
                                error={forms.countryCode.isError}
                                label="Country code"
                                value={forms.countryCode.value}
                                onChange={(e) => {
                                    forms.countryCode.value = e.target.value;
                                    setForms({ ...forms });
                                }}
                                helperText={forms.countryCode.helperText}
                            />
                            <TextField
                                required
                                fullWidth
                                error={forms.phoneNumber.isError}
                                label="Phone number"
                                value={forms.phoneNumber.value}
                                onChange={(e) => {
                                    forms.phoneNumber.value = e.target.value;
                                    setForms({ ...forms });
                                }}
                                helperText={forms.phoneNumber.helperText}
                            />
                        </Stack>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <TextField
                            required
                            fullWidth
                            error={forms.email.isError}
                            label="E-mail"
                            value={forms.email.value}
                            onChange={(e) => {
                                forms.email.value = e.target.value;
                                setForms({ ...forms });
                            }}
                            helperText={forms.email.helperText}
                        />
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <TextField
                            required
                            fullWidth
                            error={forms.avatarUrl.isError}
                            label="Avatar URL"
                            value={forms.avatarUrl.value}
                            onChange={(e) => {
                                forms.avatarUrl.value = e.target.value;
                                setForms({ ...forms });
                            }}
                            helperText={forms.avatarUrl.helperText}
                        />
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <FormControl component="fieldset">
                            <FormGroup aria-label="position" row>
                                <FormControlLabel
                                    value="start"
                                    control={<Checkbox onChange={handleChange} />}
                                    label="Verified"
                                    labelPlacement="start"
                                />
                            </FormGroup>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={8} textAlign="right">
                        <Button
                            variant="contained"
                            onClick={(e) => {
                                validateAndAdd();
                            }}
                        >
                            Add new user
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Layout>
    );
}
