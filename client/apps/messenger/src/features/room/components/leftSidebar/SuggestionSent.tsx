import React from "react";
import { Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export default function SuggestionSent() {
    const { t } = useTranslation();

    return (
        <Stack p="32px" gap="32px" justifyContent="center" alignItems="center">
            <Stack gap="24px" justifyContent="center" alignItems="center">
                <Typography
                    fontSize="34px"
                    color="text.secondary"
                    textAlign="center"
                    fontWeight={600}
                    lineHeight={1.2}
                >
                    {t("suggestionSubmittedSuccessfully")}
                </Typography>
                <Typography textAlign="center" fontSize="14px">
                    {t("suggestionThankYou")}
                </Typography>
            </Stack>
        </Stack>
    );
}
1;
