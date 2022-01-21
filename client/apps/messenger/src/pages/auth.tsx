import React, { useState } from "react";
import { useHistory } from "react-router-dom";

import { useSignUpMutation, useVerifyMutation, useUpdateMutation } from "../api/auth";

import AuthLayout from "../components/AuthLayout";
import VerificationCodeForm from "../components/VerificationCodeForm";
import TelephoneNumberForm from "../components/TelephoneNumberForm";
import UpdateUserForm from "../components/UpdateUserForm";

import useDeviceId from "../hooks/useDeviceId";
import { sha256 } from "../../../../lib/utils";
import useCountdownTimer from "../hooks/useCountdownTimer";

export default function SignUpPage(): React.ReactElement {
    const history = useHistory();
    const deviceId = useDeviceId();
    const [step, setStep] = useState(0);
    const [signUp, signUpMutation] = useSignUpMutation();
    const [verify, verifyMutation] = useVerifyMutation();
    const [update, updateMutation] = useUpdateMutation();
    const timer = useCountdownTimer(60);

    const handleSignUp = async (telephoneNumber: string) => {
        try {
            timer.start();
            await signUp({
                telephoneNumber,
                telephoneNumberHashed: sha256(telephoneNumber),
                deviceId,
            });
            setStep(1);
        } catch (error) {
            console.error("Sign up error", error);
        }
    };

    const handleVerify = async (code: string) => {
        try {
            const res = await verify({ code, deviceId }).unwrap();

            if (res.device?.token) {
                window.localStorage.setItem("access-token", res.device.token);

                if (signUpMutation.data.isNewUser) {
                    setStep(2);
                } else {
                    history.push("/");
                }
            } else {
                console.error("Token not returned");
            }
        } catch (error) {
            console.log({ error });
        }
    };

    const handleSetUsername = async (username: string) => {
        try {
            await update({ displayName: username }).unwrap();
            history.push("/");
        } catch (error) {
            console.error("Update failed ", error);
        }
    };

    return (
        <AuthLayout loading={signUpMutation.isLoading || verifyMutation.isLoading}>
            {step === 0 && <TelephoneNumberForm onSubmit={handleSignUp} />}

            {step === 1 && (
                <VerificationCodeForm
                    onSubmit={handleVerify}
                    onResend={() => handleSignUp(signUpMutation.data?.user.telephoneNumber)}
                    telephoneNumber={signUpMutation.data?.user.telephoneNumber}
                    error={verifyMutation.error as any}
                    timeLeft={timer.left}
                />
            )}

            {step === 2 && (
                <UpdateUserForm onSubmit={handleSetUsername} error={updateMutation.error as any} />
            )}
        </AuthLayout>
    );
}
