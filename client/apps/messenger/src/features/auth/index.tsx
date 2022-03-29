import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useSignUpMutation, useVerifyMutation, useUpdateMutation } from "./api/auth";

import AuthLayout from "./components/AuthLayout";
import VerificationCodeForm from "./components/VerificationCodeForm";
import TelephoneNumberForm from "./components/TelephoneNumberForm";
import UpdateUserForm from "./components/UpdateUserForm";

import useDeviceId from "./hooks/useDeviceId";
import { sha256 } from "../../../../../lib/utils";
import useCountdownTimer from "./hooks/useCountdownTimer";
import uploadFile from "../../utils/uploadFile";

export default function Auth(): React.ReactElement {
    const navigate = useNavigate();
    const deviceId = useDeviceId();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
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
                    navigate("/app");
                }
            } else {
                console.error("Token not returned");
            }
        } catch (error) {
            console.log({ error });
        }
    };

    const handleUpdateUser = async ({ username, file }: { username: string; file: File }) => {
        try {
            setLoading(true);
            const uploadedFile = await uploadFile({
                file,
                type: "avatar",
                relationId: signUpMutation.data?.user.id,
            });

            await update({ displayName: username, avatarUrl: uploadedFile.path }).unwrap();
            setLoading(false);

            navigate("/app");
        } catch (error) {
            setLoading(false);

            console.error("Update failed ", error);
        }
    };

    return (
        <AuthLayout loading={signUpMutation.isLoading || verifyMutation.isLoading || loading}>
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
                <UpdateUserForm onSubmit={handleUpdateUser} error={updateMutation.error as any} />
            )}
        </AuthLayout>
    );
}
