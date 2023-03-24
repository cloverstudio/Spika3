import api from "@/api";

type SuccessResponse = {
    status: "success";
    data: { token: string };
};

type ErrorResponse = {
    status: "error";
    message: string;
};

const authApi = api.injectEndpoints({
    endpoints: (build) => ({
        checkAccessToken: build.query<string, void>({
            query: (token) => `/management/auth/check?token=${token}`,
        }),

        adminSignIn: build.mutation<SuccessResponse | ErrorResponse, any>({
            query: (data) => {
                return { url: "/management/auth", data, method: "POST" };
            },
        }),
    }),
    overrideExisting: true,
});

export const { useCheckAccessTokenQuery, useAdminSignInMutation } = authApi;
export default authApi;
