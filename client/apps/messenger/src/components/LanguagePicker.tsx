import React from "react";
import { Box } from "@mui/material";
import HRLogo from "../assets/languageFlags/HR.svg";
import ENLogo from "../assets/languageFlags/EN.svg";
import { useTranslation } from "react-i18next";

export function LanguagePicker() {
    const { i18n } = useTranslation();

    const currentLanguage = i18n.language;

    const availableLanguages = [
        {
            name: "Croatian",
            code: "hr",
            flag: HRLogo,
        },

        {
            name: "English",
            code: "en",
            flag: ENLogo,
        },
    ];

    return (
        <Box
            sx={{
                display: "flex",
                gap: "24px",
                userSelect: "none",
            }}
        >
            {availableLanguages.map((language) => (
                <Box key={language.code} onClick={() => i18n.changeLanguage(language.code)}>
                    <Box
                        component="img"
                        draggable="false"
                        src={language.flag}
                        alt={`${language.name} logo`}
                        width={{
                            xs: "40px",
                            md: "40px",
                        }}
                        sx={{
                            cursor: "pointer",
                            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.15)",
                            "&:hover": {
                                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.25)",
                                border: "solid 2px #E5F4FF",
                            },
                            transition: "all 0.1s",
                            borderRadius: "8px",
                            ...(currentLanguage === language.code && {
                                border: "solid 2px #E5F4FF",
                            }),
                        }}
                    />
                </Box>
            ))}
        </Box>
    );
}
