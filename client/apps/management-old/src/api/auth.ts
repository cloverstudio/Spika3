import api from "./api";

const authApi = api.injectEndpoints({
    endpoints: (build) => ({
        checkAccessToken: build.query<string, void>({
            query: () => `/management/auth/check`,
            providesTags: [{ type: "Auth", id: "me" }],
        }),

        adminSignin: build.mutation<string, any>({
            query: (data) => {
                return { url: "/management/auth", data, method: "POST" };
            },
            invalidatesTags: [{ type: "Auth", id: "me" }],
        }),
    }),
    overrideExisting: true,
});

export const { useCheckAccessTokenQuery, useAdminSigninMutation } = authApi;
export default authApi;
