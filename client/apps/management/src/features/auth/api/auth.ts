import api, { SuccessResponse, ErrorResponse } from "@/api";

const authApi = api.injectEndpoints({
    endpoints: (build) => ({
        checkAccessToken: build.query<string, void>({
            query: (token) => `/management/auth/check?token=${token}`,
        }),

        adminSignIn: build.mutation<SuccessResponse<{ token: string }> | ErrorResponse, any>({
            query: (data) => {
                return { url: "/management/auth", data, method: "POST" };
            },
        }),
    }),
    overrideExisting: true,
});

export const { useCheckAccessTokenQuery, useAdminSignInMutation } = authApi;
export default authApi;
