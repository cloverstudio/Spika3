import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Link } from "@mui/material";

import { useSignUpMutation, useVerifyMutation } from "../api/auth";

import AuthLayout from "../components/AuthLayout";
import VerificationCodeForm from "../components/VerificationCodeForm";
import TelephoneNumberForm from "../components/TelephoneNumberForm";

import useDeviceId from "../hooks/useDeviceId";
import { sha256 } from "../../../../lib/utils";

export default function SignUpPage(): React.ReactElement {
    const history = useHistory();
    const deviceId = useDeviceId();
    const [signUp, signUpMutation] = useSignUpMutation();
    const [verify, verifyMutation] = useVerifyMutation();

    const handleSignUp = (telephoneNumber: string) => {
        signUp({ telephoneNumber, telephoneNumberHashed: sha256(telephoneNumber), deviceId });
    };

    useEffect(() => {
        if (verifyMutation.isSuccess && verifyMutation.data?.device?.token) {
            console.log({ verifyData: verifyMutation.data });
            window.localStorage.setItem("access-token", verifyMutation.data.device.token);
            history.push("/");
        }
    }, [verifyMutation]);

    const handleVerify = (code: string) => {
        console.log({ code, deviceId });
        verify({ code, deviceId });
    };

    return (
        <AuthLayout loading={signUpMutation.isLoading || verifyMutation.isLoading}>
            {signUpMutation.isSuccess ? (
                <VerificationCodeForm
                    onSubmit={handleVerify}
                    onResend={() => handleSignUp(signUpMutation.data?.user.telephoneNumber)}
                    telephoneNumber={signUpMutation.data?.user.telephoneNumber}
                    error={verifyMutation.error}
                />
            ) : (
                <TelephoneNumberForm onSubmit={handleSignUp} />
            )}

            <Link fontWeight="bold" underline="hover" href="/sign-up" variant="body1">
                New here? Create account
            </Link>
        </AuthLayout>
    );
}
