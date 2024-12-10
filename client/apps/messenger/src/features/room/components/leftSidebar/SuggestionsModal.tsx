import React, { useState, useRef, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    IconButton,
    Typography,
    Stack,
    TextField,
    Link,
    Button,
    CircularProgress,
    Tooltip,
    Box,
    useTheme,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { ReactComponent as UploadIcon } from "../../../../assets/Upload.svg";
import { ReactComponent as SendIcon } from "../../../../assets/send.svg";
import getFileType from "../../lib/getFileType";
import FileUploader from "../../../../utils/FileUploader";
import { useShowSnackBar } from "../../../../hooks/useModal";
import { useAddSuggestionMutation } from "../../api/user";
import SuggestionSent from "./SuggestionSent";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function SuggestionsModal({ isOpen, onClose }: Props) {
    const { t } = useTranslation();
    const [suggestion, setSuggestion] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuggestionSent, setIsSuggestionSent] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const showSnackBar = useShowSnackBar();

    const [addSuggestion] = useAddSuggestionMutation();
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";

    useEffect(() => {
        if (isOpen) {
            setIsSuggestionSent(false);
            setFile(null);
            setError(null);
        }
    }, [isOpen]);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setError(null);

        const transfer = e.nativeEvent.dataTransfer;

        if (transfer?.items && transfer.items.length > 0) {
            const firstItem = transfer.items[0];
            if (firstItem.kind === "file") {
                const file = firstItem.getAsFile();
                if (file && validateFile(file)) {
                    setFile(file);
                }
            }
        }
    };

    const validateFile = (file: File) => {
        const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
        const maxSizeInBytes = 5 * 1024 * 1024;

        if (!allowedTypes.includes(file.type)) {
            setError(t("invalidFileType"));
            return false;
        }

        if (file.size > maxSizeInBytes) {
            setError(t("fileTooLarge"));
            return false;
        }

        return true;
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);

        const selectedFile = e.target.files?.[0];
        if (selectedFile && validateFile(selectedFile)) {
            setFile(selectedFile);
        }
    };

    const handleBrowseClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
        fileInputRef.current.value = null;
    };

    const uploadFile = async () => {
        if (!file) return null;

        let uploadedFile: { id: number } | null = null;

        const type = getFileType(file.type);
        const fileUploader = new FileUploader({
            file: file,
            type,
        });

        uploadedFile = await fileUploader.upload();

        if (!uploadedFile || !uploadedFile.id) {
            showSnackBar({
                severity: "error",
                text: t("errorUploadingFile"),
            });
            return null;
        } else {
            return uploadedFile.id;
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        let fileId: number;

        if (file) {
            fileId = await uploadFile();
        }

        if (fileId === null && file) {
            return;
        }

        try {
            await addSuggestion({ suggestion, fileId }).unwrap();
            setIsSuggestionSent(true);
            setTimeout(() => {
                onClose();
            }, 4000);
        } catch (err) {
            showSnackBar({
                severity: "error",
                text: t("errorSubmittingSuggestion"),
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            maxWidth="lg"
            scroll="body"
            sx={{
                ".MuiDialog-paper": {
                    maxWidth: isSuggestionSent ? "421px" : "573px",
                },
            }}
        >
            <Box
                sx={{
                    backgroundColor: "background.paper",
                }}
            >
                {isSuggestionSent ? (
                    <SuggestionSent />
                ) : (
                    <form onSubmit={handleSubmit}>
                        <Stack p="32px" gap="32px">
                            <DialogTitle
                                sx={{
                                    fontSize: "16px",
                                    textAlign: "center",
                                    color: "text.secondary",
                                    p: 0,
                                }}
                            >
                                {t("platformImprovement")}
                            </DialogTitle>
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

                            <Stack gap="8px">
                                <Typography fontSize="12px" color="text.secondary">
                                    {t("platformImprovementDescription")}
                                </Typography>
                                <TextField
                                    multiline
                                    placeholder={t("platformImprovementTextareaPlaceholder")}
                                    minRows={4.5}
                                    inputProps={{ maxLength: 500 }}
                                    onChange={(e) => setSuggestion(e.target.value)}
                                />
                            </Stack>

                            <Stack>
                                <Typography fontSize="12px" color="text.secondary">
                                    {t("platformImprovementChoosePhoto")}
                                </Typography>
                                <ul
                                    style={{
                                        color: isDarkMode ? "fff" : "#000080",
                                        fontSize: "12px",
                                        paddingLeft: 20,
                                    }}
                                >
                                    <li>{t("platformImprovementAcceptedFormats")}</li>
                                    <li>{t("platformImprovementMaxFileSize")}</li>
                                </ul>
                                <Stack
                                    bgcolor={isDarkMode ? "calendarDropdown" : "#E9F4FD"}
                                    height="175px"
                                    justifyContent="center"
                                    alignItems="center"
                                    gap="4px"
                                    borderRadius="10px"
                                    border="1px solid #C9C9CA"
                                    onDrop={handleDrop}
                                    onDragOver={(e) => e.preventDefault()}
                                    position="relative"
                                >
                                    {file ? (
                                        <>
                                            <img
                                                src={URL.createObjectURL(file)}
                                                style={{
                                                    height: "100%",
                                                    width: "100%",
                                                    objectFit: "contain",
                                                }}
                                            />
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
                                                    onClick={handleRemoveFile}
                                                    sx={{
                                                        "&.MuiButtonBase-root:hover": {
                                                            bgcolor: "#E5F4FF",
                                                        },
                                                        position: "absolute",
                                                        top: 0,
                                                        right: 0,
                                                        bgcolor: "#E5F4FF",
                                                        width: "28px",
                                                        height: "28px",
                                                    }}
                                                >
                                                    <Close
                                                        htmlColor="#000080"
                                                        sx={{ height: "16px", width: "16px" }}
                                                    />
                                                </IconButton>
                                            </Tooltip>
                                        </>
                                    ) : (
                                        <>
                                            <UploadIcon />
                                            <Stack textAlign="center">
                                                <Typography
                                                    fontSize="12px"
                                                    color={isDarkMode ? "#C9C9CA" : "#000080"}
                                                >
                                                    {t("platformImprovementDrag&Drop")}
                                                </Typography>
                                                <Link
                                                    fontSize="12px"
                                                    color={isDarkMode ? "#C9C9CA" : "#000080"}
                                                    fontWeight="bold"
                                                    sx={{ cursor: "pointer" }}
                                                    onClick={handleBrowseClick}
                                                >
                                                    {t("searchComputer")}
                                                </Link>
                                            </Stack>
                                        </>
                                    )}
                                </Stack>
                                {error && (
                                    <Typography color="error" fontSize="12px" mt="4px">
                                        {error}
                                    </Typography>
                                )}
                                <input
                                    type="file"
                                    accept="image/png, image/jpeg, image/jpg"
                                    style={{ display: "none" }}
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                />
                            </Stack>

                            <Button
                                variant="contained"
                                color="primary"
                                type="submit"
                                sx={{ backgroundColor: "#000080", textTransform: "uppercase" }}
                                startIcon={
                                    isLoading ? (
                                        <CircularProgress
                                            size={20}
                                            sx={{
                                                color: "text.secondary",
                                            }}
                                        />
                                    ) : (
                                        <SendIcon />
                                    )
                                }
                                disabled={!suggestion || isLoading}
                            >
                                {t("send")}
                            </Button>
                        </Stack>
                    </form>
                )}
            </Box>
        </Dialog>
    );
}
