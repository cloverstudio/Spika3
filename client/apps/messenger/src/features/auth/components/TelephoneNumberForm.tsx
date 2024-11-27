import React, { useState } from "react";

import Button from "@mui/material/Button";
import FormLabel from "@mui/material/FormLabel";
import { Box } from "@mui/material";
import Typography from "@mui/material/Typography";

import CountryPicker from "./CountryPicker";
import { useTranslation } from "react-i18next";
import { APP_NAME } from "../../../../../../lib/constants";
import ReCaptcha from "../../../components/ReCaptcha";

type TelephoneNumberFormProps = {
    onSubmit: (telephoneNumber: string) => void;
    setRecaptchaToken: (token: string) => void;
    recaptchaToken: string;
};

export default function TelephoneNumberForm({
    onSubmit,
    setRecaptchaToken,
    recaptchaToken,
}: TelephoneNumberFormProps): React.ReactElement {
    const { t } = useTranslation();
    const [countryCode, setCountryCode] = useState("385");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [validPhoneNumber, setValidPhoneNumber] = useState(false);

    const handleSubmit = () => {
        if (!validPhoneNumber || !recaptchaToken) {
            return;
        }
        const formattedPhoneNumber = phoneNumber.startsWith("0")
            ? phoneNumber.substring(1)
            : phoneNumber;

        onSubmit(`+${countryCode}${formattedPhoneNumber}`);
    };

    const onReCaptchaChange = async (value: string) => {
        if (value) {
            setRecaptchaToken(value);
        }
    };

    return (
        <>
            <Typography
                display={{ xs: "none", md: "block" }}
                mb={3}
                component="h1"
                variant="h3"
                fontWeight="bold"
            >
                {t("welcome")}
            </Typography>

            <Typography
                component="p"
                variant="body1"
                mx={{ xs: "auto", md: 0 }}
                maxWidth={{ xs: "220px", md: "none" }}
                mb={{ xs: 5, md: 10 }}
                fontWeight="medium"
            >
                {`${t("enterYourPhoneNumber")} ${APP_NAME}`}
            </Typography>

            <Box textAlign="left" mb={{ xs: 3, md: 6 }}>
                <FormLabel sx={{ mb: 1.5, display: "block" }}>{t("phoneNumber")}</FormLabel>
                <CountryPicker
                    code={setCountryCode}
                    setPhoneNumber={setPhoneNumber}
                    phoneNumber={phoneNumber}
                    validation={setValidPhoneNumber}
                />
                <Box sx={{ mt: 2 }}>
                    <ReCaptcha onChange={onReCaptchaChange} />
                </Box>
                <Button
                    onClick={handleSubmit}
                    disabled={!validPhoneNumber || !recaptchaToken}
                    fullWidth
                    variant="contained"
                    id="submitButton"
                    sx={{ marginTop: "1em" }}
                >
                    {t("next")}
                </Button>
            </Box>
        </>
    );
}
