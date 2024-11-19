import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useSignUpMutation, useVerifyMutation, useUpdateMutation } from "./api/auth";

import AuthLayout from "./components/AuthLayout";
import VerificationCodeForm from "./components/VerificationCodeForm";
import TelephoneNumberForm from "./components/TelephoneNumberForm";
import UpdateUserForm from "./components/UpdateUserForm";

import { generateRandomString, sha256 } from "../../../../../lib/utils";
import useCountdownTimer from "./hooks/useCountdownTimer";
import * as constants from "../../../../../lib/constants";
import { getDeviceId } from "../../../../../lib/utils";
import { useTranslation } from "react-i18next";
import { showSnackBar } from "../../store/modalSlice";
import getFileType from "../room/lib/getFileType";
import FileUploader from "../../utils/FileUploader";
import TermsAndConditions from "./components/TearmsAndConditions";
import { useAppDispatch } from "../../hooks";
import Cookie from "universal-cookie";

const globalCookie = new Cookie();

declare const ENV: string;

export default function Auth(): React.ReactElement {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const deviceId = getDeviceId();
    const dispatch = useAppDispatch();
    const [step, setStep] = useState(-1);
    const [loading, setLoading] = useState(false);
    const [signUp, signUpMutation] = useSignUpMutation();
    const [verify, verifyMutation] = useVerifyMutation();
    const [update, updateMutation] = useUpdateMutation();
    const [infoMsg, setInfoMsg] = useState<string>("");
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [sentCount, setSentCount] = useState<number>(0);
    const [recaptchaToken, setRecaptchaToken] = useState("");

    const timer = useCountdownTimer(120);

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
                    text: t("youHaveBeenLoggedOut"),
                }),
            );
        }
    }, [dispatch, t]);

    const handleSignUp = async (telephoneNumber: string) => {
        try {
            setSentCount(sentCount + 1);

            timer.start();
            const signUpResponse = await signUp({
                telephoneNumber,
                telephoneNumberHashed: sha256(telephoneNumber),
                deviceId: deviceId,
            }).unwrap();

            if (signUpResponse.browserDeviceId) {
                // override device id
                localStorage.setItem(constants.LSKEY_DEVICEID, signUpResponse.browserDeviceId);
                localStorage.removeItem(constants.LSKEY_DISABLEPUSHALER);
            } else {
                throw new Error("No browserDeviceId returned");
            }

            if (sentCount > 0) setInfoMsg(t("verificationCodeResent"));

            setStep(1);
        } catch (error) {
            console.error("Sign up error", error);
        }
    };

    const handleVerify = async (code: string) => {
        try {
            const res = await verify({ code, deviceId, recaptchaToken }).unwrap();
            setRecaptchaToken("");

            if (ENV === "localhost") {
                globalCookie.set("isLoggedIn", true, {
                    path: "/",
                    expires: new Date(2147483647000),
                    domain: "localhost",
                    sameSite: "strict",
                });
            }
            if (res.device?.token) {
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
            let uploadedFile: { id: number };

            if (file) {
                const type = getFileType(file.type);
                const fileUploader = new FileUploader({
                    file,
                    type,
                });

                uploadedFile = await fileUploader.upload();
            }

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
                {step === -1 && <TermsAndConditions onSubmit={() => setStep(0)} />}
                {step === 0 && (
                    <TelephoneNumberForm
                        onSubmit={handleSignUp}
                        recaptchaToken={recaptchaToken}
                        setRecaptchaToken={setRecaptchaToken}
                    />
                )}

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
