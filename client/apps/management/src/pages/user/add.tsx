import React from "react";
import Layout from "../layout";
import { useNavigate } from "react-router-dom";
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
import { useShowSnackBar } from "../../components/useUI";
import * as yup from "yup";
import { useFormik } from "formik";

const userModelSchema = yup.object({
    displayName: yup.string().required("Display name is required"),
    telephoneNumber: yup
        .number()
        .required("Telephone number is required")
        .typeError("Numbers only!"),
    email: yup.string().required("Email is required").email("Not valid email"),
    avatarUrl: yup.string().url(),
    verified: yup.boolean(),
});

export default function Dashboard() {
    const navigate = useNavigate();
    const showSnackBar = useShowSnackBar();

    const formik = useFormik({
        initialValues: {
            displayName: "",
            telephoneNumber: "",
            email: "",
            avatarUrl: "",
            verified: false,
        },
        validationSchema: userModelSchema,
        onSubmit: (values) => {
            validateAndAdd();
        },
    });

    const [verified, setVerified] = React.useState<boolean>(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setVerified(event.target.checked);
    };

    const post = usePost();

    const validateAndAdd = async () => {
        try {
            const result = await post("/api/management/user", {
                displayName: formik.values.displayName,
                emailAddress: formik.values.email,
                telephoneNumber: formik.values.telephoneNumber,
                avatarUrl: formik.values.avatarUrl,
                verified: formik.values.verified,
            });

            showSnackBar({ severity: "success", text: "User added" });
            navigate("/user");
        } catch (e: any) {
            showSnackBar({
                severity: "error",
                text: String(e.message),
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
                                        control={
                                            <Checkbox
                                                id="verified"
                                                onChange={formik.handleChange}
                                            />
                                        }
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
