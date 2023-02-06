import React, { useState } from "react";

import Button from "@mui/material/Button";
import FormLabel from "@mui/material/FormLabel";
import { Box } from "@mui/material";
import Typography from "@mui/material/Typography";

import CountryPicker from "./CountryPicker";
import useStrings from "../../../hooks/useStrings";
import { APP_NAME } from "../../../../../../lib/constants";

type TelephoneNumberFormProps = {
    onSubmit: (telephoneNumber: string) => void;
};

export default function TelephoneNumberForm({
    onSubmit,
}: TelephoneNumberFormProps): React.ReactElement {
    const strings = useStrings();
    const [countryCode, setCountryCode] = useState("385");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [validPhoneNumber, setValidPhoneNumber] = useState(false);

    const handleSubmit = () => {
        const formattedPhoneNumber = phoneNumber.startsWith("0")
            ? phoneNumber.substring(1)
            : phoneNumber;

        onSubmit(`+${countryCode}${formattedPhoneNumber}`);
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
                {strings.welcome}
            </Typography>

            <Typography
                component="p"
                variant="body1"
                mx={{ xs: "auto", md: 0 }}
                maxWidth={{ xs: "220px", md: "none" }}
                mb={{ xs: 2, md: 2 }}
                fontWeight="medium"
            >
                {`${strings.enterYourPhoneNumber}`}
                <a target="_blank" href="https://ai.clover.studio/spika/">
                    <br />
                    Please visit web site for detail.
                </a>
            </Typography>

            <Box textAlign="left" mb={{ xs: 3, md: 6 }}>
                <FormLabel sx={{ mb: 1.5, display: "block" }}>{strings.phoneNumber}</FormLabel>
                <CountryPicker
                    code={setCountryCode}
                    setPhoneNumber={setPhoneNumber}
                    phoneNumber={phoneNumber}
                    validation={setValidPhoneNumber}
                />
                <Button
                    onClick={handleSubmit}
                    disabled={!validPhoneNumber}
                    fullWidth
                    variant="contained"
                    sx={{ marginTop: "1em" }}
                >
                    {strings.next}
                </Button>
            </Box>
        </>
    );
}
