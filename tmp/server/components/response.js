"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successResponse = exports.errorResponse = void 0;
function errorResponse(message, lang) {
    var messageTable = {
        "Error happens": {
            ja: "エラーが発生しました。",
        },
    };
    var translation = messageTable[message]
        ? messageTable[message][lang]
        : null;
    return {
        status: "fail",
        message: translation || message,
    };
}
exports.errorResponse = errorResponse;
function successResponse(data, lang) {
    return {
        status: "success",
        data: data,
    };
}
exports.successResponse = successResponse;
//# sourceMappingURL=response.js.map