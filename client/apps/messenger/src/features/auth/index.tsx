import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useSignUpMutation, useVerifyMutation, useUpdateMutation } from "./api/auth";

import AuthLayout from "./components/AuthLayout";
import VerificationCodeForm from "./components/VerificationCodeForm";
import TelephoneNumberForm from "./components/TelephoneNumberForm";
import UpdateUserForm from "./components/UpdateUserForm";

import { generateRandomString, sha256 } from "../../../../../lib/utils";
import useCountdownTimer from "./hooks/useCountdownTimer";
import uploadFile from "../../utils/uploadFile";
import * as constants from "../../../../../lib/constants";
import { getDeviceId } from "../../../../../lib/utils";
import useStrings from "../../hooks/useStrings";
import { useDispatch } from "react-redux";
import { showSnackBar } from "../../store/modalSlice";

export default function Auth(): React.ReactElement {
    const strings = useStrings();
    const navigate = useNavigate();
    const deviceId = getDeviceId();
    const dispatch = useDispatch();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [signUp, signUpMutation] = useSignUpMutation();
    const [verify, verifyMutation] = useVerifyMutation();
    const [update, updateMutation] = useUpdateMutation();
    const [infoMsg, setInfoMsg] = useState<string>("");
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [sentCount, setSentCount] = useState<number>(0);

    const timer = useCountdownTimer(60);

    useEffect(() => {
        setInfoMsg("");
        verifyMutation.error && setErrorMsg((verifyMutation.error as any).message);
    }, [verifyMutation]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const logout = urlParams.get("logout");

        if (logout === "force") {
            dispatch(
                showSnackBar({
                    severity: "error",
                    text: strings.youHaveBeenLoggedOut,
                })
            );
        }
    }, [dispatch, strings.youHaveBeenLoggedOut]);

    const handleSignUp = async (telephoneNumber: string) => {
        try {
            setSentCount(sentCount + 1);

            timer.start();
            const signUpResponse = await signUp({
                telephoneNumber,
                telephoneNumberHashed: sha256(telephoneNumber),
                deviceId: generateRandomString(14),
            }).unwrap();

            if (signUpResponse.browserDeviceId) {
                // override device id
                localStorage.setItem(constants.LSKEY_DEVICEID, signUpResponse.browserDeviceId);
                localStorage.removeItem(constants.LSKEY_DISABLEPUSHALER);
            } else {
                throw new Error("No browserDeviceId returned");
            }

            if (sentCount > 0) setInfoMsg(strings.verificationCodeResent);

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

    const handleUpdateUser = async ({ username, file }: { username: string; file: File }) => {
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
                displayName: username,
                avatarFileId: uploadedFile?.id || 0,
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
                        onSubmit={handleUpdateUser}
                        error={updateMutation.error as any}
                    />
                )}
            </>
        </AuthLayout>
    );
}
