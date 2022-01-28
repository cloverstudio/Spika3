"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useUpdateMutation = exports.useVerifyMutation = exports.useSignUpMutation = void 0;
var api_1 = __importDefault(require("./api"));
var userApi = api_1.default.injectEndpoints({
    endpoints: function (build) { return ({
        signUp: build.mutation({
            query: function (data) {
                return { url: "/messenger/auth", method: "POST", data: data };
            },
        }),
        verify: build.mutation({
            query: function (data) {
                return { url: "/messenger/auth/verify", method: "POST", data: data };
            },
        }),
        update: build.mutation({
            query: function (data) {
                return { url: "/messenger/me", method: "PUT", data: data };
            },
        }),
    }); },
    overrideExisting: true,
});
exports.useSignUpMutation = userApi.useSignUpMutation, exports.useVerifyMutation = userApi.useVerifyMutation, exports.useUpdateMutation = userApi.useUpdateMutation;
//# sourceMappingURL=auth.js.map