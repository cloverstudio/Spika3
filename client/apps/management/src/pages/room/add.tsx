import React from "react";
import Layout from "../layout";
import { useNavigate } from "react-router-dom";
import { usePost } from "../../lib/useApi";
import { TextField, Paper, Grid, Button } from "@mui/material";
import { useShowSnackBar } from "../../components/useUI";
import * as yup from "yup";
import { useFormik } from "formik";

const roomModelSchema = yup.object({
    name: yup.string().required("Name is required"),
    type: yup.string().required("Type is required"),
    avatarUrl: yup.string().url(),
    deleted: yup.boolean(),
});

export default function RoomAdd() {
    const navigate = useNavigate();
    const showSnackBar = useShowSnackBar();
    const post = usePost();

    const formik = useFormik({
        initialValues: {
            name: "",
            type: "",
            avatarUrl: "",
            deleted: false,
        },
        validationSchema: roomModelSchema,
        onSubmit: (values) => {
            validateAndAdd();
        },
    });

    const validateAndAdd = async () => {
        try {
            const result = await post("/management/room", {
                name: formik.values.name,
                type: formik.values.type,
                avatarUrl: formik.values.avatarUrl,
                deleted: formik.values.deleted,
            });

            showSnackBar({ severity: "success", text: "Room added" });
            navigate("/room");
        } catch (e: any) {
            console.error(e);
            showSnackBar({
                severity: "error",
                text: String(e.message),
            });
        }
    };

    return (
        <Layout subtitle="Add new room" showBack={true}>
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
                                id="name"
                                error={formik.touched.name && Boolean(formik.errors.name)}
                                label="Name"
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                helperText={formik.touched.name && formik.errors.name}
                            />
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <TextField
                                required
                                fullWidth
                                id="type"
                                error={formik.touched.type && Boolean(formik.errors.type)}
                                label="Type"
                                value={formik.values.type}
                                onChange={formik.handleChange}
                                helperText={formik.touched.type && formik.errors.type}
                            />
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <TextField
                                fullWidth
                                id="avatarUrl"
                                error={formik.touched.avatarUrl && Boolean(formik.errors.avatarUrl)}
                                label="Avatar Url"
                                value={formik.values.avatarUrl}
                                onChange={formik.handleChange}
                                helperText={formik.touched.avatarUrl && formik.errors.avatarUrl}
                            />
                        </Grid>
                        <Grid item xs={12} md={8} textAlign="right">
                            <Button variant="contained" type="submit">
                                Add new room
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </form>
        </Layout>
    );
}
