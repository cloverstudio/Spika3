import React from "react";

import Button from "@mui/material/Button";
import { Box } from "@mui/material";
import Typography from "@mui/material/Typography";

import useStrings from "../../../hooks/useStrings";
import { TERMS_AND_CONDITIONS_URL } from "../../../../../../lib/constants";

type TermsAndConditionsProps = {
    onSubmit: () => void;
};

export default function TermsAndConditions({
    onSubmit,
}: TermsAndConditionsProps): React.ReactElement {
    const strings = useStrings();

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
                mb={{ xs: 5, md: 10 }}
                fontWeight="medium"
            >
                {`${strings.acceptTermsInstructions}`}
                <a
                    href={TERMS_AND_CONDITIONS_URL}
                    target="_blank"
                    rel="noreferrer"
                >{` ${strings.termsAndConditions}`}</a>
            </Typography>

            <Box textAlign="left" mb={{ xs: 3, md: 6 }}>
                <Button onClick={onSubmit} fullWidth variant="contained">
                    {strings.agreeAndContinue}
                </Button>
            </Box>
        </>
    );
}
