import React from "react";
import Layout from "../layout";
import { useHistory } from "react-router-dom";
import { useGet, usePost } from "../../lib/useApi";

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

import { useShowSnackBar } from "../../components/useUI";
import * as yup from "yup";
import { useFormik } from "formik";

const userModelSchema = yup.object({
    displayName: yup.string().required("Display name is required"),
    countryCode: yup.number().required("Code is required").typeError("Numbers only!"),
    telephoneNumber: yup
        .number()
        .required("Telephone number is required")
        .typeError("Numbers only!"),
    email: yup.string().required("Email is required").email("Not valid email"),
    avatarUrl: yup.string().url(),
    verified: yup.boolean(),
});

export default function Dashboard() {
    const history = useHistory();
    const showSnackBar = useShowSnackBar();

    const formik = useFormik({
        initialValues: {
            displayName: "",
            countryCode: "",
            telephoneNumber: "",
            email: "",
            avatarUrl: "",
            verified: false,
        },
        validationSchema: userModelSchema,
        onSubmit: (values) => {
            checkPhoneNumber();
        },
    });

    const [verified, setVerified] = React.useState<boolean>(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setVerified(event.target.checked);
    };

    const get = useGet();
    const post = usePost();

    const checkPhoneNumber = async () => {
        try {
            const response = await get(
                `/api/management/user/existingUserParams?countryCode=${formik.values.countryCode}&telephoneNumber=${formik.values.telephoneNumber}&email=${formik.values.email}`
            );
            if (!response.exists) {
                validateAndAdd();
            } else {
                var errorText = "";
                if (response.phoneExist && response.emailExists) {
                    errorText = "User with that phone number and email already exists";
                } else if (response.phoneExist) {
                    errorText = "User with that country code and telephone number already exists";
                } else if (response.emailExists) {
                    errorText = "User with that email already exists";
                }
                showSnackBar({
                    severity: "error",
                    text: errorText,
                });
            }
        } catch (e) {
            console.error(e);
            showSnackBar({
                severity: "error",
                text: "Server error, please check browser console.",
            });
        }
    };

    const validateAndAdd = async () => {
        try {
            const result = await post("/api/management/user", {
                displayName: formik.values.displayName,
                emailAddress: formik.values.email,
                countryCode: formik.values.countryCode,
                telephoneNumber: formik.values.telephoneNumber,
                avatarUrl: formik.values.avatarUrl,
                verified: formik.values.verified,
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
    };

    return (
        <Layout subtitle="Add new user" showBack={true}>
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
                                id="displayName"
                                error={
                                    formik.touched.displayName && Boolean(formik.errors.displayName)
                                }
                                label="Display Name"
                                value={formik.values.displayName}
                                onChange={formik.handleChange}
                                helperText={formik.touched.displayName && formik.errors.displayName}
                            />
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <Stack alignItems="center" spacing={1} direction="row">
                                <TextField
                                    required
                                    id="countryCode"
                                    error={
                                        formik.touched.countryCode &&
                                        Boolean(formik.errors.countryCode)
                                    }
                                    label="Country code"
                                    value={formik.values.countryCode}
                                    onChange={formik.handleChange}
                                    helperText={
                                        formik.touched.countryCode && formik.errors.countryCode
                                    }
                                />
                                <TextField
                                    required
                                    fullWidth
                                    id="telephoneNumber"
                                    error={
                                        formik.touched.telephoneNumber &&
                                        Boolean(formik.errors.telephoneNumber)
                                    }
                                    label="Phone number"
                                    value={formik.values.telephoneNumber}
                                    onChange={formik.handleChange}
                                    helperText={
                                        formik.touched.telephoneNumber &&
                                        formik.errors.telephoneNumber
                                    }
                                />
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <TextField
                                fullWidth
                                required
                                id="email"
                                error={formik.touched.email && Boolean(formik.errors.email)}
                                label="E-mail"
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                helperText={formik.touched.email && formik.errors.email}
                            />
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <TextField
                                fullWidth
                                id="telephoneNumber"
                                error={formik.touched.avatarUrl && Boolean(formik.errors.avatarUrl)}
                                label="Avatar Url"
                                value={formik.values.avatarUrl}
                                onChange={formik.handleChange}
                                helperText={formik.touched.avatarUrl && formik.errors.avatarUrl}
                            />
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <FormControl component="fieldset">
                                <FormGroup aria-label="position" row>
                                    <FormControlLabel
                                        value="start"
                                        control={<Checkbox onChange={formik.handleChange} />}
                                        label="Verified"
                                        labelPlacement="start"
                                    />
                                </FormGroup>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={8} textAlign="right">
                            <Button variant="contained" type="submit">
                                Add new user
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </form>
        </Layout>
    );
}
