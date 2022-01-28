"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificationCodeSMS = void 0;
function verificationCodeSMS(_a) {
    var verificationCode = _a.verificationCode, osName = _a.osName;
    var message = "Thank you for your signup request.Your verification code is " + verificationCode + ".";
    if (osName === "android") {
        message += "\n\n" + process.env.ANDROID_SMS_VERIFICATION_HASH;
    }
    else if (osName === "ios") {
        message += "\n\n@" + process.env.IOS_SMS_VERIFICATION_URL + " #" + verificationCode;
    }
    return message;
}
exports.verificationCodeSMS = verificationCodeSMS;
//# sourceMappingURL=string.js.map