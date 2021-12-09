import React, { useEffect } from "react";
import Layout from "../layout";
import { useHistory, useParams } from "react-router-dom";
import { useGet, usePut } from "../../lib/useApi";
import {
    TextField,
    Paper,
    Grid,
    Button,
    FormGroup,
    FormControl,
    FormControlLabel,
    Checkbox,
} from "@mui/material";
import { useShowSnackBar } from "../../components/useUI";
import { Room } from "@prisma/client";
import * as yup from "yup";
import { useFormik } from "formik";
import { successResponseType } from "../../../../../../server/components/response";

const roomModelSchema = yup.object({
    name: yup.string().required("Name is required"),
    type: yup.string().required("Type is required"),
    avatarUrl: yup.string().url(),
    deleted: yup.boolean(),
});

export default function RoomEdit() {
    const urlParams: { id: string } = useParams();
    const history = useHistory();
    const showSnackBar = useShowSnackBar();
    const get = useGet();
    const put = usePut();

    const formik = useFormik({
        initialValues: {
            name: "",
            type: "",
            avatarUrl: "",
            deleted: false,
        },
        validationSchema: roomModelSchema,
        onSubmit: (values) => {
            validateAndUpdate();
        },
    });

    useEffect(() => {
        (async () => {
            try {
                const serverResponse: successResponseType = await get(
                    `/api/management/room/${urlParams.id}`
                );
                const response: Room = serverResponse.data.room;
                const checkName = response.name == null ? "" : response.name;
                const checkType = response.type == null ? "" : response.type;
                const checkUrl = response.avatarUrl == null ? "" : response.avatarUrl;
                const checkDel = response.deleted == null ? false : response.deleted;
                formik.setValues({
                    name: checkName,
                    type: checkType,
                    avatarUrl: checkUrl,
                    deleted: checkDel,
                });
            } catch (e) {
                console.error(e);
                showSnackBar({
                    severity: "error",
                    text: "Server error, please check browser console.",
                });
            }
        })();
    }, []);

    const validateAndUpdate = async () => {
        try {
            const result = await put(`/api/management/room/${urlParams.id}`, {
                name: formik.values.name,
                type: formik.values.type,
                avatarUrl: formik.values.avatarUrl,
                deleted: formik.values.deleted,
            });

            showSnackBar({ severity: "success", text: "Room updated" });
            history.push("/room");
        } catch (e: any) {
            showSnackBar({
                severity: "error",
                text: String(e.message),
            });
        }
    };

    return (
        <Layout subtitle={`Room detail ( ${urlParams.id} )`} showBack={true}>
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
                        <Grid item xs={12} md={8}>
                            <FormControl component="fieldset">
                                <FormGroup aria-label="position" row>
                                    <FormControlLabel
                                        value="start"
                                        control={
                                            <Checkbox
                                                checked={formik.values.deleted}
                                                id="deleted"
                                                onChange={formik.handleChange}
                                            />
                                        }
                                        label="Deleted"
                                        labelPlacement="start"
                                    />
                                </FormGroup>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={8} textAlign="right">
                            <Button variant="contained" type="submit">
                                Edit room
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </form>
        </Layout>
    );
}
