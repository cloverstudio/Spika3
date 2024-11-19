import React, { useEffect, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import PropTypes from "prop-types";
import { useMediaQuery, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";

interface ReCaptchaProps {
    onChange?: (token?: string | null) => void;
    onErrored?: () => void;
    value?: string | null;
}

declare const RECAPTCHA_SITE_KEY: string;

export default function ReCaptcha({
    onChange = () => {},
    onErrored = () => {},
    value = null,
}: ReCaptchaProps): React.ReactElement {
    const captchaRef = useRef<ReCAPTCHA | null>(null);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const isDarkTheme = theme.palette.mode === "dark";
    const { i18n } = useTranslation();

    useEffect(() => {
        if (!value) {
            captchaRef.current.reset();
            onChange(null);
        }
    }, [value]);

    const onChangeHandler = (token: string | null) => {
        onChange(token);
    };

    const onExpiredHandler = () => {
        onChange(null);
    };

    const onErrorHandler = () => {
        onChange(null);
        onErrored();
    };

    return (
        <div
            style={{
                width: "100%",
                maxWidth: isMobile ? "270px" : "100%",
                overflow: "hidden",
            }}
        >
            <div style={{ transform: isMobile ? "scale(0.8)" : "none", transformOrigin: "0 0" }}>
                <ReCAPTCHA
                    ref={captchaRef}
                    className=""
                    sitekey={RECAPTCHA_SITE_KEY}
                    onChange={onChangeHandler}
                    onExpired={onExpiredHandler}
                    onErrored={onErrorHandler}
                    theme={isDarkTheme ? "dark" : "light"}
                    hl={i18n.language || "en"}
                />
            </div>
        </div>
    );
}

ReCaptcha.propTypes = {
    onChange: PropTypes.func,
    onErrored: PropTypes.func,
    value: PropTypes.string,
};
