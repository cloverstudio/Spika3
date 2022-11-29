import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useSignUpMutation, useVerifyMutation, useUpdateMutation } from "./api/auth";

import AuthLayout from "./components/AuthLayout";
import VerificationCodeForm from "./components/VerificationCodeForm";
import TelephoneNumberForm from "./components/TelephoneNumberForm";
import UpdateUserForm from "./components/UpdateUserForm";

import { sha256 } from "../../../../../lib/utils";
import useCountdownTimer from "./hooks/useCountdownTimer";
import uploadFile from "../../utils/uploadFile";
import * as constants from "../../../../../lib/constants";
import { getDeviceId } from "../../../../../lib/utils";
import useStrings from "../../hooks/useStrings";

export default function Auth(): React.ReactElement {
    const strings = useStrings();
    const navigate = useNavigate();
    const deviceId = getDeviceId();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [infoMsg, setInfoMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [country, setCountry] = useState("");
    const [sentCount, setSentCount] = useState(0);

    const [signUp, signUpMutation] = useSignUpMutation();
    const [verify, verifyMutation] = useVerifyMutation();
    const [update, updateMutation] = useUpdateMutation();

    const timer = useCountdownTimer(60);

    useEffect(() => {
        setInfoMsg("");
        verifyMutation.error && setErrorMsg((verifyMutation.error as any).message);
    }, [verifyMutation]);

    const handleSignUp = async (telephoneNumber: string, countryFromPhoneNumber?: string) => {
        try {
            setSentCount(sentCount + 1);

            timer.start();
            const signUpResponse = await signUp({
                telephoneNumber,
                telephoneNumberHashed: sha256(telephoneNumber),
                deviceId,
            }).unwrap();

            if (signUpResponse.browserDeviceId) {
                // override device id
                localStorage.setItem(constants.LSKEY_DEVICEID, signUpResponse.browserDeviceId);
            }

            if (sentCount > 0) setInfoMsg(strings.verificationCodeResent);

            if (countryFromPhoneNumber) {
                setCountry(countryFromPhoneNumber);
            }

            setStep(1);
        } catch (error) {
            console.error("Sign up error", error);
        }
    };

    const handleVerify = async (code: string) => {
        try {
            const res = await verify({ code, deviceId }).unwrap();

            if (res.device?.token) {
                window.localStorage.setItem(constants.LSKEY_ACCESSTOKEN, res.device.token);

                if (signUpMutation?.data?.isNewUser) {
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

    const handleUpdateUser = async ({
        file,
        firstName,
        lastName,
        dob,
        city,
        country,
        gender,
        email,
    }: {
        file: File;
        firstName: string;
        lastName: string;
        country: string;
        gender: string;
        city: string;
        email: string;
        dob: number;
    }) => {
        try {
            setLoading(true);
            const uploadedFile =
                file &&
                (await uploadFile({
                    file,
                    type: "avatar",
                    relationId: signUpMutation.data?.user.id,
                }));

            await update({
                avatarUrl: uploadedFile?.path || "",
                firstName,
                lastName,
                dob,
                city,
                country,
                gender,
                email,
                telephoneNumber: signUpMutation.data?.user.telephoneNumber,
            }).unwrap();
            setLoading(false);

            navigate("/app");
        } catch (error) {
            setLoading(false);

            console.error("Update failed ", error);
        }
    };

    return (
        <AuthLayout loading={signUpMutation.isLoading || verifyMutation.isLoading || loading}>
            <>
                {step === 0 && <TelephoneNumberForm onSubmit={handleSignUp} />}

                {step === 1 && (
                    <VerificationCodeForm
                        onSubmit={handleVerify}
                        onBack={() => {
                            setSentCount(0);
                            setInfoMsg("");
                            setErrorMsg("");
                            setStep(0);
                        }}
                        onResend={() => handleSignUp(signUpMutation?.data?.user.telephoneNumber)}
                        telephoneNumber={signUpMutation.data?.user.telephoneNumber}
                        error={errorMsg}
                        info={infoMsg}
                        timeLeft={timer.left}
                    />
                )}

                {step === 2 && (
                    <UpdateUserForm
                        initialCountry={country}
                        onSubmit={handleUpdateUser}
                        error={updateMutation.error as any}
                    />
                )}
            </>
        </AuthLayout>
    );
}
