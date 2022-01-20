import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import { useSignUpMutation, useVerifyMutation, useUpdateMutation } from "../api/auth";

import AuthLayout from "../components/AuthLayout";
import VerificationCodeForm from "../components/VerificationCodeForm";
import TelephoneNumberForm from "../components/TelephoneNumberForm";
import UsernameForm from "../components/UsernameForm";

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

    const handleSignUp = (telephoneNumber: string) => {
        timer.start();
        signUp({ telephoneNumber, telephoneNumberHashed: sha256(telephoneNumber), deviceId });
    };

    const handleVerify = (code: string) => {
        console.log({ code, deviceId });
        verify({ code, deviceId });
    };

    const handleSetUsername = (username: string) => {
        update({ displayName: username });
    };

    useEffect(() => {
        if (signUpMutation.isSuccess) {
            console.log({ signUpData: signUpMutation.data });
            setStep(1);
        }
    }, [signUpMutation]);

    useEffect(() => {
        if (verifyMutation.isSuccess && verifyMutation.data?.device?.token) {
            console.log({ verifyData: verifyMutation.data });
            window.localStorage.setItem("access-token", verifyMutation.data.device.token);
            if (signUpMutation.data.isNewUser) {
                setStep(2);
            } else {
                history.push("/");
            }
        }
    }, [verifyMutation]);

    useEffect(() => {
        if (updateMutation.isSuccess) {
            console.log({ updateData: updateMutation.data });
            history.push("/");
        }
    }, [updateMutation]);

    const getForm = () => {
        switch (step) {
            case 0:
                return <TelephoneNumberForm onSubmit={handleSignUp} />;
            case 1:
                return (
                    <VerificationCodeForm
                        onSubmit={handleVerify}
                        onResend={() => handleSignUp(signUpMutation.data?.user.telephoneNumber)}
                        telephoneNumber={signUpMutation.data?.user.telephoneNumber}
                        error={verifyMutation.error as any}
                        timeLeft={timer.left}
                    />
                );
            case 2:
                return <UsernameForm onSubmit={handleSetUsername} />;
            default:
                console.error("unknown step");
        }
    };

    return (
        <AuthLayout loading={signUpMutation.isLoading || verifyMutation.isLoading}>
            {getForm()}
        </AuthLayout>
    );
}
