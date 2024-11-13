import React from "react";
import { Box, Button, Dialog, IconButton, Typography, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Close } from "@mui/icons-material";
import HRLogo from "../../../../assets/languageFlags/HR.svg";
import ENLogo from "../../../../assets/languageFlags/EN.svg";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export function ChangeLanguageModal({ isOpen, onClose }: Props): React.ReactElement {
    const { i18n, t } = useTranslation();

    const currentLanguage = i18n.language;
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";

    const availableLanguages = [
        {
            name: "croatian",
            code: "hr",
            flag: HRLogo,
        },
        {
            name: "english",
            code: "en",
            flag: ENLogo,
        },
    ];

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            scroll="body"
            sx={{
                ".MuiDialog-paper": {
                    width: "430px",
                },
            }}
        >
            <Box
                sx={{
                    backgroundColor: "background.paper",
                    width: "100%",
                    p: 4,
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <IconButton
                    size="large"
                    onClick={onClose}
                    sx={{
                        position: "absolute",
                        top: "18px",
                        right: "16px",
                    }}
                >
                    <Close
                        sx={{
                            color: "text.secondary",
                        }}
                    />
                </IconButton>
                <Typography
                    sx={{
                        fontSize: "16px",
                        fontWeight: 600,
                        textAlign: "center",
                        color: "text.secondary",
                        mb: 1,
                    }}
                >
                    {t("selectLanguage")}
                </Typography>
                <Box
                    sx={{
                        height: "70px",
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: "12px",
                            fontWeight: 400,
                            textAlign: "center",
                            color: "text.secondary",
                            lineHeight: "20px",
                            mb: 4,
                        }}
                    >
                        {t("selectLanguageDescription")}
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                    }}
                >
                    {availableLanguages.map((language) => {
                        return (
                            <Box
                                key={language.code}
                                sx={{
                                    display: "flex",
                                    gap: 2,
                                    cursor: "pointer",
                                    height: "24px",
                                }}
                                onClick={() => {
                                    i18n.changeLanguage(language.code);
                                }}
                            >
                                <Box
                                    component="img"
                                    draggable="false"
                                    src={language.flag}
                                    alt={`${language.name} logo`}
                                    width="32px"
                                    boxShadow=" 0px 8px 45px 0px rgba(0, 0, 0, 0.16)"
                                    sx={{
                                        outline: "solid 3px transparent",
                                        borderRadius: "6px",
                                        ...(currentLanguage === language.code && {
                                            outline: "solid 4px #E5F4FF",
                                            borderRadius: "6px",
                                            boxShadow: "0px 4px 8px 0px rgba(0, 0, 0, 0.25)",
                                        }),
                                        transition: "all 0.2s",
                                        userSelect: "none",
                                    }}
                                />
                                <Typography
                                    sx={{
                                        fontSize: "14px",
                                        color:
                                            currentLanguage === language.code
                                                ? "text.secondary"
                                                : isDarkMode
                                                ? "#9AA0A6"
                                                : "text.primary",
                                        fontWeight: 500,
                                        userSelect: "none",
                                    }}
                                >
                                    {t(language.name)}
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>
            </Box>
        </Dialog>
    );
}
