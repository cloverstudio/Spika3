type verificationCodeSMSType = {
    verificationCode: string;
    osName: string;
};

export function verificationCodeSMS({ verificationCode, osName }: verificationCodeSMSType): string {
    let message = `Thank you for your signup request.Your verification code is ${verificationCode}.`;

    if (osName === "android") {
        message += `\n\n${process.env.ANDROID_SMS_VERIFICATION_HASH}`;
    } else if (osName === "ios") {
        message += `\n\n@example.com #${verificationCode}`;
    }
    return message;
}
