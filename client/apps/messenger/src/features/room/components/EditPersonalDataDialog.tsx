import React, { useState, useRef, useEffect } from "react";
import {
    Dialog,
    FormLabel,
    Stack,
    TextField,
    Box,
    Autocomplete,
    Radio,
    RadioGroup,
    FormControlLabel,
    Typography,
    IconButton,
    Button,
    Tooltip,
    CircularProgress,
    useMediaQuery,
    useTheme,
    InputAdornment,
} from "@mui/material";
import { Close, SaveOutlined, Add } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import countries from "../../auth/lib/countries";
import UserType from "../../../types/User";
import getFileType from "../lib/getFileType";
import { PickerChangeHandlerContext, DateValidationError } from "@mui/x-date-pickers";
import { useLazyCheckEmailQuery, useUpdateMutation } from "../../auth/api/auth";
import FileUploader from "../../../utils/FileUploader";
import avatar from "../../../assets/avatar.svg";
import { crop } from "../../../utils/crop";
import * as Constants from "../../../../../../lib/constants";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { validateEmail } from "../../../utils/helpers";
import { genderOptions } from "../lib/formOptionData";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    user: UserType;
}

export default function EditPersonalDataDialog({ isOpen, onClose, user }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [name, setName] = useState("");
    const [existingEmail, setExistingEmail] = useState("");
    const [email, setEmail] = useState("");
    const [gender, setGender] = useState("");
    const [country, setCountry] = useState("");
    const [isImageRemoved, setIsImageRemoved] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [loading, setLoading] = useState(false);

    const uploadFileRef = useRef<HTMLInputElement>(null);

    const { t, i18n } = useTranslation();
    const currentLanguage = i18n.language;

    const [update] = useUpdateMutation();
    const [checkEmail, { isFetching: isCheckingEmailValidity }] = useLazyCheckEmailQuery();

    const isSubmitDisabled =
        !name.trim() ||
        !email.trim() ||
        emailError ||
        !country ||
        loading ||
        isCheckingEmailValidity;

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const isDarkMode = theme.palette.mode === "dark";

    useEffect(() => {
        if (isOpen) {
            setFile(null);
            setIsImageRemoved(false);
            setEmailError(false);
            setName(user.displayName);
            setEmail(user.emailAddress);
            setExistingEmail(user.emailAddress);
            setGender(user.gender);
            setCountry(user.country);
        }
    }, [isOpen]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        const type = getFileType(selectedFile.type);

        if (type === "image") {
            const objectUrl = URL.createObjectURL(selectedFile);
            const croppedFile = await cropAndResizeSelectedFile(objectUrl);
            setFile(croppedFile);
            setIsImageRemoved(false);
        }
    };

    const cropAndResizeSelectedFile = async (selectedFileUrl: string) => {
        const croppedImage = await crop(
            selectedFileUrl,
            1,
            Constants.LSKEY_CROPSIZE,
            Constants.LSKEY_CROPSIZE,
        );
        return new File([croppedImage], "image.png");
    };

    const handleRemoveImage = () => {
        setFile(null);
        setIsImageRemoved(true);
        uploadFileRef.current.value = null;
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    };

    const handleGenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGender(e.target.value);
    };

    const handleCountryChange = (e, value) => {
        setCountry(value?.code || "");
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setLoading(true);
            let uploadedFile: { id: number | null } = { id: null };

            if (file) {
                const type = getFileType(file.type);
                const fileUploader = new FileUploader({
                    file,
                    type,
                });

                uploadedFile = await fileUploader.upload();
            } else if (isImageRemoved) {
                uploadedFile.id = 0;
            }

            await update({
                displayName: name,
                emailAddress: email,
                avatarFileId: uploadedFile.id ?? user.avatarFileId,
                gender,
                country,
            }).unwrap();

            setLoading(false);
            onClose();
        } catch (error) {
            setLoading(false);
            console.error("Update failed ", error);
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} maxWidth="lg" scroll="body">
            <Box
                sx={{
                    bgcolor: "background.paper",
                    maxWidth: "767px",
                }}
            >
                <IconButton
                    size="large"
                    sx={{
                        "&.MuiButtonBase-root:hover": {
                            bgcolor: "transparent",
                        },
                        position: "absolute",
                        right: 32,
                        top: 32,
                        p: 0,
                    }}
                    onClick={onClose}
                >
                    <Close
                        sx={{
                            color: "text.secondary",
                        }}
                    />
                </IconButton>
                <form onSubmit={handleSubmit}>
                    <Stack p="32px" gap="32px">
                        <Stack justifyContent="center" alignItems="center" gap="16px">
                            <Typography color="text.secondary" fontWeight={600}>
                                {t("editPersonalData")}
                            </Typography>

                            <Box position="relative" width="100px" height="100px">
                                <Box
                                    component="img"
                                    width="100px"
                                    height="100px"
                                    sx={{
                                        objectFit: "cover",
                                        borderRadius: "50%",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => uploadFileRef.current?.click()}
                                    src={
                                        file
                                            ? URL.createObjectURL(file)
                                            : user.avatarFileId && !isImageRemoved
                                            ? `${UPLOADS_BASE_URL}/${user.avatarFileId}`
                                            : avatar
                                    }
                                />
                                {!isImageRemoved && !!user.avatarFileId && (
                                    <Tooltip
                                        title={t("removeImage")}
                                        placement="top"
                                        arrow
                                        disableInteractive
                                        componentsProps={{
                                            arrow: { sx: { color: "common.tooltip" } },
                                            tooltip: {
                                                sx: {
                                                    backgroundColor: "common.tooltip",
                                                    borderRadius: "10px",
                                                    p: "8px 14px",
                                                    fontWeight: 400,
                                                    fontSize: "12px",
                                                },
                                            },
                                        }}
                                    >
                                        <IconButton
                                            onClick={handleRemoveImage}
                                            sx={{
                                                "&.MuiButtonBase-root:hover": {
                                                    bgcolor: isDarkMode ? "#C9C9CA" : "#E5F4FF",
                                                },
                                                position: "absolute",
                                                top: 0,
                                                right: 0,
                                                bgcolor: isDarkMode ? "#353535" : "#E5F4FF",
                                                width: "28px",
                                                height: "28px",
                                            }}
                                        >
                                            <Close
                                                htmlColor={isDarkMode ? "#fff" : "#000080"}
                                                sx={{
                                                    height: "16px",
                                                    width: "16px",
                                                }}
                                            />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                <Tooltip
                                    title={t("addImage")}
                                    placement="top"
                                    arrow
                                    disableInteractive
                                    componentsProps={{
                                        arrow: { sx: { color: "common.tooltip" } },
                                        tooltip: {
                                            sx: {
                                                backgroundColor: "common.tooltip",
                                                borderRadius: "10px",
                                                p: "8px 14px",
                                                fontWeight: 400,
                                                fontSize: "12px",
                                            },
                                        },
                                    }}
                                >
                                    <IconButton
                                        onClick={() => uploadFileRef.current?.click()}
                                        sx={{
                                            "&.MuiButtonBase-root:hover": {
                                                bgcolor: isDarkMode ? "#C9C9CA" : "#E5F4FF",
                                            },
                                            position: "absolute",
                                            bottom: 0,
                                            right: 0,
                                            bgcolor: isDarkMode ? "#353535" : "#E5F4FF",
                                            width: "28px",
                                            height: "28px",
                                        }}
                                    >
                                        <Add
                                            htmlColor={isDarkMode ? "#fff" : "#000080"}
                                            sx={{
                                                height: "16px",
                                                width: "16px",
                                            }}
                                        />
                                    </IconButton>
                                </Tooltip>
                                <input
                                    onChange={handleFileChange}
                                    type="file"
                                    style={{ display: "none" }}
                                    ref={uploadFileRef}
                                    accept="image/*"
                                />
                            </Box>
                        </Stack>
                        <Stack direction="row" flexWrap="wrap" gap="24px 16px">
                            <Box sx={{ flexBasis: isMobile ? "100%" : "calc(50% - 12px)" }}>
                                <FormLabel
                                    htmlFor="nameAndSurname"
                                    sx={{
                                        display: "block",
                                        fontSize: "14px",
                                        mb: 1,
                                        color: "text.secondary",
                                    }}
                                >
                                    {t("nameAndSurname")}
                                </FormLabel>
                                <TextField
                                    fullWidth
                                    placeholder={t("nameAndSurname")}
                                    id="nameAndSurname"
                                    variant="outlined"
                                    InputProps={{
                                        sx: {
                                            borderRadius: "10px",
                                            fontSize: "16px",
                                            "&:hover": {
                                                borderColor: "#000",
                                            },
                                            "&.Mui-focused": {
                                                borderColor: "#1976d2",
                                            },
                                            "& ::placeholder": { fontSize: "16px" },
                                        },
                                    }}
                                    onChange={handleNameChange}
                                    value={name}
                                    error={!name.trim()}
                                />
                            </Box>

                            <Box sx={{ flexBasis: isMobile ? "100%" : "calc(50% - 12px)" }}>
                                <FormLabel
                                    htmlFor="email"
                                    sx={{
                                        display: "block",
                                        fontSize: "14px",
                                        mb: 1,
                                        color: "text.secondary",
                                    }}
                                >
                                    {t("email")}
                                </FormLabel>
                                <TextField
                                    fullWidth
                                    placeholder={t("email")}
                                    id="email"
                                    type="email"
                                    variant="outlined"
                                    InputProps={{
                                        sx: {
                                            borderRadius: "10px",
                                            fontSize: "16px",
                                            "&:hover": {
                                                borderColor: "#000",
                                            },
                                            "&.Mui-focused": {
                                                borderColor: "#1976d2",
                                            },
                                            "& ::placeholder": { fontSize: "16px" },
                                        },
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                {isCheckingEmailValidity && (
                                                    <CircularProgress
                                                        size={20}
                                                        sx={{
                                                            color: "text.secondary",
                                                        }}
                                                    />
                                                )}
                                            </InputAdornment>
                                        ),
                                    }}
                                    onChange={(e) => {
                                        const enteredEmail = e.target.value;

                                        const isValidEmail = validateEmail(enteredEmail);
                                        if (!isValidEmail) {
                                            setEmailError(true);
                                        } else {
                                            setEmailError(false);
                                        }
                                        setEmail(enteredEmail);
                                    }}
                                    onBlur={async () => {
                                        if (!email || email === existingEmail || emailError) return;
                                        const response = await checkEmail(email);
                                        if (response.error) {
                                            setEmailError(true);
                                            return;
                                        }
                                        setEmailError(false);
                                    }}
                                    value={email}
                                    error={!email.trim() || emailError}
                                />
                            </Box>

                            <Box sx={{ flexBasis: isMobile ? "100%" : "calc(50% - 12px)" }}>
                                <FormLabel
                                    htmlFor="countrySelect"
                                    sx={{
                                        display: "block",
                                        fontSize: "14px",
                                        mb: 1,
                                        color: "text.secondary",
                                    }}
                                >
                                    {t("country")}
                                </FormLabel>
                                <Autocomplete
                                    disablePortal
                                    id="countrySelect"
                                    options={countries}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            placeholder={t("country")}
                                            error={!country}
                                        />
                                    )}
                                    value={countries.find((c) => c.code === country) || null}
                                    fullWidth
                                    onChange={handleCountryChange}
                                    getOptionLabel={(option) =>
                                        option[`label${currentLanguage.toUpperCase()}`]
                                    }
                                />
                            </Box>
                            <br />
                            <Box sx={{ flexBasis: isMobile ? "100%" : "calc(50% - 12px)" }}>
                                <FormLabel
                                    sx={{
                                        display: "block",
                                        fontSize: "14px",
                                        mb: 1,
                                        color: "text.secondary",
                                    }}
                                >
                                    {t("gender")}
                                </FormLabel>
                                <RadioGroup
                                    row
                                    aria-labelledby="demo-row-radio-buttons-group-label"
                                    name="row-radio-buttons-group"
                                    sx={{ justifyContent: "space-between" }}
                                    onChange={handleGenderChange}
                                    value={gender}
                                >
                                    {genderOptions.map((option) => (
                                        <FormControlLabel
                                            key={option.id}
                                            value={option.value}
                                            control={<Radio size="small" />}
                                            label={t(option.label)}
                                            sx={{
                                                mr: 0,
                                                "& .MuiFormControlLabel-label": {
                                                    fontWeight: 500,
                                                },
                                            }}
                                        />
                                    ))}
                                </RadioGroup>
                            </Box>
                        </Stack>

                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            sx={{
                                backgroundColor: "common.mainBlue",
                                textTransform: "uppercase",
                                fontWeight: 700,
                            }}
                            startIcon={
                                loading ? (
                                    <CircularProgress
                                        size={20}
                                        sx={{
                                            color: "text.secondary",
                                        }}
                                    />
                                ) : (
                                    <SaveOutlined />
                                )
                            }
                            disabled={isSubmitDisabled}
                        >
                            {t("save")}
                        </Button>
                    </Stack>
                </form>
            </Box>
        </Dialog>
    );
}
