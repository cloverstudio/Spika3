export function veryficationCodeSMS({
  verificationCode,
}: {
  verificationCode: string;
}) {
  return `Thank you for your signup request.Your verification code is ${verificationCode}.`;
}
