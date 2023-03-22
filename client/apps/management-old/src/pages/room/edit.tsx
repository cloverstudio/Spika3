import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    TextField,
    Stack,
    Button,
    FormGroup,
    FormControl,
    FormControlLabel,
    Checkbox,
    Typography,
    Box,
    Select,
    MenuItem,
    SelectChangeEvent,
} from "@mui/material";
import { useShowSnackBar } from "../../components/useUI";
import * as yup from "yup";
import { useFormik } from "formik";
import { useGetRoomByIdQuery, useUpdateRoomMutation } from "../../api/room";
import RoomType from "../../types/Room";
import uploadFile from "../../utils/uploadFile";
import uploadImage from "../../assets/upload-image.svg";
import { hide } from "../../store/rightDrawerSlice";
import { useDispatch } from "react-redux";

declare const UPLOADS_BASE_URL: string;

const roomModelSchema = yup.object({
    name: yup.string().required("Name is required"),
    type: yup.string().required("Type is required"),
    avatarUrl: yup.string().url(),
    deleted: yup.boolean(),
});

type EditRoomProps = {
    roomId: string;
};

export default function RoomEdit(props: EditRoomProps) {
    const { roomId } = props;
    const navigate = useNavigate();
    const showSnackBar = useShowSnackBar();
    const { data, isLoading } = useGetRoomByIdQuery(roomId);
    const [updateRoom, updateRoomMutation] = useUpdateRoomMutation();
    const [file, setFile] = useState<File>();
    const uploadFileRef = React.useRef(null);
    const dispatch = useDispatch();

    const [value, setValue] = React.useState("private");

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = e.target.files && e.target.files[0];

        setFile(uploadedFile);
    };

    const handleChange = (event: SelectChangeEvent) => {
        setValue(event.target.value);
    };

    const formik = useFormik({
        initialValues: {
            name: "",
            type: value,
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
            if (!isLoading) {
                const response: RoomType = data.room;
                console.log(JSON.stringify(response));
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
            }
        })();
    }, [data]);

    const validateAndUpdate = async () => {
        try {
            if (file) {
                const uploadedFile = await uploadFile({
                    file,
                    type: "avatar",
                    relationId: Number(roomId),
                });
                await updateRoom({
                    roomId: roomId,
                    data: {
                        name: formik.values.name,
                        type: value,
                        avatarUrl: uploadedFile.path || "",
                        deleted: formik.values.deleted,
                    },
                });
            } else {
                await updateRoom({
                    roomId: roomId,
                    data: {
                        name: formik.values.name,
                        type: value,
                        avatarUrl: formik.values.avatarUrl,
                        deleted: formik.values.deleted,
                    },
                });
            }

            showSnackBar({ severity: "success", text: "Room updated" });
            dispatch(hide());
        } catch (e: any) {
            showSnackBar({
                severity: "error",
                text: String(e.message),
            });
        }
    };

    return (
        <form onSubmit={formik.handleSubmit}>
            <Stack spacing={2} padding={2}>
                <Typography component="h1" variant="subtitle1" noWrap style={{ color: "grey" }}>
                    Edit Room
                </Typography>
                <Box textAlign="center" mt={3} mb={5}>
                    <img
                        width={100}
                        height={100}
                        style={{ objectFit: "cover", borderRadius: "50%" }}
                        src={
                            file
                                ? URL.createObjectURL(file)
                                : formik.values.avatarUrl.length > 0
                                ? `${UPLOADS_BASE_URL}${formik.values.avatarUrl}`
                                : uploadImage
                        }
                        onClick={() => uploadFileRef.current?.click()}
                    />
                    <input
                        onChange={handleFileUpload}
                        type="file"
                        style={{ display: "none" }}
                        ref={uploadFileRef}
                        accept="image/*"
                    />
                </Box>
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
                <Select
                    labelId="demo-select-small"
                    id="demo-select-small"
                    value={value}
                    label="Type"
                    onChange={handleChange}
                >
                    <MenuItem sx={{ height: "50px" }} value={"private"} key={0}>
                        Private
                    </MenuItem>
                    <MenuItem sx={{ height: "50px" }} value={"group"} key={1}>
                        Group
                    </MenuItem>
                </Select>
                <FormControl component="fieldset">
                    <FormGroup aria-label="position" row>
                        <FormControlLabel
                            value="start"
                            control={
                                <Checkbox
                                    id="deleted"
                                    color="spikaButton"
                                    onChange={formik.handleChange}
                                    checked={formik.values.deleted}
                                />
                            }
                            label={
                                <Typography style={{ color: "grey" }} variant="body2">
                                    Deleted
                                </Typography>
                            }
                            labelPlacement="start"
                            sx={{ ml: "0" }}
                        />
                    </FormGroup>
                </FormControl>
                <Stack spacing={2} direction="row">
                    <Button
                        variant="contained"
                        onClick={() => validateAndUpdate()}
                        color="spikaButton"
                    >
                        Edit room
                    </Button>
                    <Button variant="outlined" color="spikaGrey" onClick={() => dispatch(hide())}>
                        Cancel
                    </Button>
                </Stack>
            </Stack>
        </form>
    );
}
