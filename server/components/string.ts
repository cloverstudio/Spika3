export function verificationCodeSMS({ verificationCode }: { verificationCode: string }) {
    return `Thank you for your signup request.Your verification code is ${verificationCode}.`;
}
